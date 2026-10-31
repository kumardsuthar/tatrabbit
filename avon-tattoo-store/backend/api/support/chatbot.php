<?php
// backend/api/support/chatbot.php
require_once __DIR__ . '/../../middleware/Cors.php';
require_once __DIR__ . '/../../config/db.php';

handleCors();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$message = trim($input['message'] ?? '');
$contextOrder = $input['order_id'] ?? null;

if (empty($message)) {
    http_response_code(400);
    echo json_encode(['error' => 'Message string is required']);
    exit;
}

$pdo = getDbConnection();
$whatsappNumber = $_ENV['SUPPORT_WHATSAPP'] ?? '+917048136880';
$whatsappUrl = "https://wa.me/" . preg_replace('/[^0-9]/', '', $whatsappNumber) . "?text=" . urlencode("Hi Master Tech, I need direct assistance with my tattoo gear or order.");

$msgLower = strtolower($message);

// -------------------------------------------------------------
// 1. GREETING INTENT
// -------------------------------------------------------------
if (preg_match('/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|sup|yo)\b/i', $message) && strlen($message) < 25) {
    $reply = "Hey artist! Welcome to TatRabbit. I'm Alex, your Studio AI Advisor.\n\n" .
             "I can assist you with:\n" .
             "• Products & Equipment: Search any machine, ink, needle size, or studio supply.\n" .
             "• Studio Knowledge Base: About us, location, policies & scraped website data.\n" .
             "• Live Order Tracking: Enter Order # (e.g., #1 or ATS-1004) or AWB number.\n\n" .
             "How can I help you today?";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'greeting'
    ]);
    exit;
}

// -------------------------------------------------------------
// 2. COMPANY / LOCATION / ABOUT US INTENT
// -------------------------------------------------------------
if (preg_match('/about\s*us|about\s*tatrabbit|about\s*avon|where\s*(?:are\s*you|is\s*your)|location|address|ahmedabad|city|office|headquarters|contact|phone|call\s*number|who\s*are\s*you/i', $message)) {
    $reply = "Here is information about TatRabbit:\n\n" .
             "• Headquarters Location: Based in Ahmedabad, Gujarat, India.\n" .
             "• Contact / WhatsApp Order Line: +91 7048136880 (Support & Direct Studio Orders).\n" .
             "• Serving Artists Nationwide: Fast shipping across Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Jaipur, and all cities in India.\n" .
             "• Catalog Range: Over 2,000+ hand-checked, sterilized tattoo products including rotary pens, certified inks, cartridge needles, power units, and studio furniture.\n" .
             "• Certified Quality: 100% genuine products sourced directly from global brand partners.\n\n" .
             "Would you like to search products in our store or track an active shipment?";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'about_us'
    ]);
    exit;
}

// -------------------------------------------------------------
// 3. ORDER TRACKING ENGINE
// -------------------------------------------------------------
$order = null;
$searchedTerm = trim($message);
$isOrderQuery = preg_match('/track|shipment|delivery|where is my|package|courier|awb|dispatch|status|order|#/i', $message) || !empty($contextOrder);

$candidates = [];
if ($contextOrder) $candidates[] = (string)$contextOrder;
if (!empty($searchedTerm)) {
    $candidates[] = $searchedTerm;
    $candidates[] = ltrim($searchedTerm, '#');
    $candidates[] = '#' . ltrim($searchedTerm, '#');
}

if (preg_match_all('/#?([A-Z0-9_-]{1,50})/i', $message, $m)) {
    foreach ($m[1] as $tok) {
        $tokClean = trim($tok);
        if (in_array(strtolower($tokClean), ['order', 'track', 'tracking', 'status', 'awb', 'shipment', 'delivery', 'package', 'courier', 'where', 'is', 'my', 'please', 'for', 'the', 'tatrabbit', 'avon'])) {
            continue;
        }
        $candidates[] = $tokClean;
        $candidates[] = '#' . $tokClean;
    }
}

$candidates = array_unique(array_filter($candidates));

foreach ($candidates as $cand) {
    $cleanNoHash = ltrim($cand, '#');
    $numId = (is_numeric($cand) ? (int)$cand : (is_numeric($cleanNoHash) ? (int)$cleanNoHash : 0));
    $candLower = strtolower($cand);
    $candStripped = strtolower($cleanNoHash);
    $candHashed = '#' . strtolower($cleanNoHash);

    $stmt = $pdo->prepare("
        SELECT o.*, u.email 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        WHERE (o.id = ? AND ? > 0)
           OR LOWER(o.order_number) = ?
           OR LOWER(o.order_number) = ?
           OR LOWER(o.tracking_number) = ? 
           OR LOWER(o.tracking_number) = ?
           OR LOWER(o.tracking_number) = ?
           OR LOWER(o.razorpay_order_id) = ? 
           OR LOWER(o.razorpay_payment_id) = ?
        LIMIT 1
    ");
    $stmt->execute([
        $numId, $numId,
        $candLower, $candStripped,
        $candLower, $candStripped, $candHashed,
        $candLower, $candLower
    ]);
    $found = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($found) {
        $order = $found;
        $searchedTerm = $cand;
        break;
    }
}

if (!$order && preg_match('/(\+?\d{10,12})/', $message, $pm)) {
    $cleanPhone = preg_replace('/[^0-9]/', '', $pm[1]);
    $stmt = $pdo->prepare("SELECT o.*, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE REPLACE(o.shipping_phone, ' ', '') LIKE ? ORDER BY o.id DESC LIMIT 1");
    $stmt->execute(['%' . $cleanPhone . '%']);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($order) {
        $searchedTerm = $cleanPhone;
    }
}

if ($order) {
    $itemStmt = $pdo->prepare("SELECT * FROM order_items WHERE order_id = ?");
    $itemStmt->execute([$order['id']]);
    $items = $itemStmt->fetchAll(PDO::FETCH_ASSOC);

    $itemListStr = "";
    if (!empty($items)) {
        $itemLines = [];
        foreach ($items as $it) {
            $variantStr = $it['variant_name'] ? " ({$it['variant_name']})" : "";
            $itemLines[] = "• {$it['title']}{$variantStr} × {$it['quantity']} (₹" . number_format($it['unit_price'], 2) . ")";
        }
        $itemListStr = "\n\nOrder Contents:\n" . implode("\n", $itemLines);
    }

    $statusFormatted = ucwords(str_replace('_', ' ', $order['tracking_status']));
    $courier = $order['courier_name'] ? $order['courier_name'] : 'TatRabbit Express Courier';
    $trackingNum = $order['tracking_number'] ? $order['tracking_number'] : 'AWB Allocation Pending';
    $trackingLink = $order['tracking_url'] ? "\nLive Courier Link: " . $order['tracking_url'] : "";
    $totalFormatted = "₹" . number_format($order['total_amount'], 2);
    $displayOrderNum = !empty($order['order_number']) ? $order['order_number'] : ('ATS-' . (1000 + $order['id']));

    $reply = "I located Order #{$displayOrderNum} (Ref: {$trackingNum}) in our logistics database!\n\n" .
             "• Status: {$statusFormatted}\n" .
             "• Total Paid: {$totalFormatted} (" . strtoupper($order['payment_status']) . ")\n" .
             "• Dispatch Courier: {$courier}\n" .
             "• Tracking / AWB: {$trackingNum}{$trackingLink}{$itemListStr}\n\n" .
             "Medical-grade protective packing applied. Need any updates to your shipping address? Let me know!";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'order' => $order,
        'action' => 'order_found'
    ]);
    exit;
} elseif (($isOrderQuery && preg_match('/\d+/', $message)) || (preg_match('/^#?\d+$/', $message))) {
    $reply = "No order records found matching '{$searchedTerm}' in our studio logistics database.\n\n" .
             "• Please double-check your Order ID (e.g. #1 or ATS-1004) or AWB Tracking Number.\n" .
             "• You can also track using your 10-digit mobile number entered at checkout.\n\n" .
             "Need direct verification? Click below to chat directly with our Master Tech support line on WhatsApp!";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'order_not_found'
    ]);
    exit;
}

// -------------------------------------------------------------
// 4. POLICIES & PAYMENTS INTENT
// -------------------------------------------------------------
if (preg_match('/why\s*(?:choose|buy|select)|why\s*tatrabbit|why\s*avon|advantage|reason|benefit|quality/i', $message)) {
    $reply = "Here is why leading professional tattoo artists choose TatRabbit:\n\n" .
             "• 100% Sterilized Guarantee: EO gas sterilized cartridges with protective safety membranes.\n" .
             "• Express Dispatch: Fast Pan-India courier delivery with medical-grade protective packaging.\n" .
             "• Direct Studio Pricing: Premium rotary pens, obsidian inks, and precision needles without middleman markups.\n" .
             "• Dedicated Support: Technical studio consultation and helpful customer service.";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'why_choose_us'
    ]);
    exit;
}

if (preg_match('/return|warranty|replace|refund|policy|cancel/i', $message)) {
    $reply = "Here are TatRabbit's Refund & Return Policy guidelines:\n\n" .
             "• 48-Hour Return Window: Return requests for eligible unopened and unused products must be submitted within 48 hours of delivery in original packaging.\n" .
             "• Hygiene & Safety: For hygiene reasons, opened personal-care products, ointments, and green soaps cannot normally be returned.\n" .
             "• Refund Processing: Approved refunds are processed within 3–7 business days after receipt and verification.\n\n" .
             "For return assistance or questions, contact our support team below!";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'policy_info'
    ]);
    exit;
}

if (preg_match('/deducted|pending|money taken|failed|debited|charged|razorpay/i', $message)) {
    $reply = "If your payment was debited while order status shows pending:\n\n" .
             "1. Razorpay automatically reconciles bank transactions within 1 to 2 hours.\n" .
             "2. Once confirmed, your order status automatically updates to 'paid'.\n" .
             "3. If you have a Payment ID or Order #, share it here or contact Master Tech support below!";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'payment_assistance'
    ]);
    exit;
}

// -------------------------------------------------------------
// 5. UNIFIED STORE & KNOWLEDGE BASE SEARCH ENGINE
// -------------------------------------------------------------

$stopWords = ['the', 'and', 'for', 'you', 'can', 'how', 'what', 'with', 'this', 'that', 'have', 'are', 'your', 'give', 'show', 'tell', 'want', 'need', 'please', 'from', 'price', 'cost', 'where', 'when', 'which', 'there', 'here', 'some', 'any', 'much', 'like', 'know', 'get', 'find', 'buy', 'item', 'items', 'good', 'best', 'top', 'new', 'rate', 'many', 'more', 'details', 'detail', 'info', 'information', 'option', 'options', 'specs', 'specification', 'specifications'];

$rawWords = array_unique(array_filter(explode(' ', strtolower(preg_replace('/[^\w\s]/', '', $message)))));
$queryWords = array_values(array_filter($rawWords, function($w) use ($stopWords) {
    return strlen($w) >= 2 && !in_array($w, $stopWords);
}));

$isCatalogOverview = preg_match('/catalog|catalogue|all products|product list|show products|list products|browse|store items|shop items|available products/i', $message);

// A. SEARCH STORE DATABASE PRODUCTS
$prodStmt = $pdo->query("SELECT * FROM `products` WHERE `is_active` = 1 ORDER BY `id` DESC");
$dbProducts = $prodStmt->fetchAll(PDO::FETCH_ASSOC);

$matchedDbProducts = [];
foreach ($dbProducts as $p) {
    $varStmt = $pdo->prepare("SELECT * FROM `product_variants` WHERE `product_id` = ?");
    $varStmt->execute([$p['id']]);
    $p['variants'] = $varStmt->fetchAll(PDO::FETCH_ASSOC);
    if (!empty($p['faqs']) && is_string($p['faqs'])) {
        $p['faqs'] = json_decode($p['faqs'], true);
    }

    $score = calculateMatchScore($p['title'] . ' ' . $p['category'] . ' ' . ($p['description'] ?? ''), $queryWords);

    if (preg_match('/machine|rotary|pen/i', $message) && strpos(strtolower($p['category']), 'machine') !== false) $score += 20;
    if (preg_match('/needle|cartridge/i', $message) && strpos(strtolower($p['category']), 'needle') !== false) $score += 20;
    if (preg_match('/ink|pigment/i', $message) && strpos(strtolower($p['category']), 'ink') !== false) $score += 20;
    if (preg_match('/power|cable|supply/i', $message) && strpos(strtolower($p['category']), 'power') !== false) $score += 20;

    if ($score > 0 || $isCatalogOverview) {
        $matchedDbProducts[] = [
            'product' => $p,
            'score' => $score
        ];
    }
}

usort($matchedDbProducts, function($a, $b) { return $b['score'] - $a['score']; });

// B. SEARCH KNOWLEDGE BASE RECORDS
$pdo->exec("CREATE TABLE IF NOT EXISTS `knowledge_base` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `type` ENUM('url', 'note', 'file') NOT NULL DEFAULT 'note',
    `source` VARCHAR(500) NULL,
    `content` LONGTEXT NOT NULL,
    `file_path` VARCHAR(500) NULL,
    `file_size` INT NULL,
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

$kbStmt = $pdo->query("SELECT * FROM `knowledge_base` WHERE `is_active` = 1");
$knowledgeItems = $kbStmt->fetchAll(PDO::FETCH_ASSOC);

$matchedKbProducts = [];
$matchedKbSnippets = [];

foreach ($knowledgeItems as $kbItem) {
    $content = $kbItem['content'];
    $kbTitle = $kbItem['title'];

    if (preg_match_all('/PRODUCT:\s*([^\|]+)\|\s*PRICE:\s*([^\|]+)\|\s*IMAGE:\s*([^\|]+)\|\s*LINK:\s*([^\n\r]+)/i', $content, $mStruct, PREG_SET_ORDER)) {
        foreach ($mStruct as $m) {
            $pTitle = trim($m[1]);
            $pPrice = trim($m[2]);
            $pImg = trim($m[3]);
            $pLink = trim($m[4]);
            
            $s = calculateMatchScore($pTitle, $queryWords);
            if ($s >= 10) {
                $matchedKbProducts[] = [
                    'product' => [
                        'id' => 'kb_' . md5($pTitle),
                        'title' => $pTitle,
                        'base_price' => preg_replace('/[^0-9\.]/', '', $pPrice),
                        'offer_price' => null,
                        'image_url' => $pImg,
                        'external_link' => $pLink,
                        'category' => 'Knowledge Base Equipment',
                        'stock' => 50
                    ],
                    'score' => $s
                ];
            }
        }
    }

    if (preg_match_all('/###\s*([^\n\r]+)\s*[\r\n]+(?:\s*Out of Stock\s*[\r\n]+)?\s*(₹\s*[\d,]+)/i', $content, $mHead, PREG_SET_ORDER)) {
        foreach ($mHead as $m) {
            $pTitle = trim($m[1]);
            $pPrice = trim($m[2]);
            
            $s = calculateMatchScore($pTitle, $queryWords);
            if ($s >= 10) {
                $matchedKbProducts[] = [
                    'product' => [
                        'id' => 'kb_' . md5($pTitle),
                        'title' => $pTitle,
                        'base_price' => preg_replace('/[^0-9\.]/', '', $pPrice),
                        'offer_price' => null,
                        'image_url' => '',
                        'external_link' => '',
                        'category' => 'Knowledge Base Equipment',
                        'stock' => 50
                    ],
                    'score' => $s
                ];
            }
        }
    }

    $kbScore = calculateMatchScore($kbTitle, $queryWords) * 2;
    $contentLower = strtolower($content);
    foreach ($queryWords as $qw) {
        if (strlen($qw) >= 3 && strpos($contentLower, $qw) !== false) {
            $kbScore += 5;
        }
    }

    if ($kbScore >= 10) {
        $extracted = extractSmartSnippet($content, $queryWords, 500);
        if (!empty($extracted)) {
            $matchedKbSnippets[] = [
                'title' => $kbTitle,
                'snippet' => $extracted,
                'score' => $kbScore
            ];
        }
    }
}

usort($matchedKbProducts, function($a, $b) { return $b['score'] - $a['score']; });
usort($matchedKbSnippets, function($a, $b) { return $b['score'] - $a['score']; });

// -------------------------------------------------------------
// 6. PRIORITIZED RESPONSE GENERATION
// -------------------------------------------------------------

$topDb = !empty($matchedDbProducts) ? $matchedDbProducts[0] : null;
$topKbProd = !empty($matchedKbProducts) ? $matchedKbProducts[0] : null;
$topKbSnippet = !empty($matchedKbSnippets) ? $matchedKbSnippets[0] : null;

// CASE A: Direct Product Match from Database (Highest priority)
if ($topDb && $topDb['score'] >= 15) {
    $p = $topDb['product'];
    $priceStr = "₹" . number_format($p['base_price'], 2);
    if ($p['offer_price']) {
        $priceStr = "₹" . number_format($p['offer_price'], 2) . " (Offer) / ₹" . number_format($p['base_price'], 2) . " Reg.";
    }
    $stockStr = $p['stock'] > 0 ? "In Stock ({$p['stock']} available)" : "Out of Stock";

    $variantLines = [];
    if (!empty($p['variants'])) {
        foreach ($p['variants'] as $v) {
            $variantLines[] = "• {$v['name']} — ₹" . number_format($v['price'], 2);
        }
    }

    $cleanDesc = preg_replace('/Note:\s*Because bcrypt.*?(?=\n\n|\r\n\r\n|$)/is', '', $p['description'] ?? '');
    $cleanDesc = preg_replace('/bcrypt|Admin123/i', '', $cleanDesc);
    $cleanDesc = trim($cleanDesc);
    if (empty($cleanDesc)) {
        $cleanDesc = "Surgical grade professional tattoo equipment engineered for lining and shading.";
    }

    $reply = "Here are the product specifications for '{$p['title']}':\n\n" .
             "• Category: {$p['category']}\n" .
             "• Price: {$priceStr}\n" .
             "• Stock Status: {$stockStr}\n\n" .
             "Description:\n{$cleanDesc}";

    if (!empty($variantLines)) {
        $reply .= "\n\nAvailable Configurations & Options:\n" . implode("\n", $variantLines);
    }

    $reply .= "\n\nClick below to view full details or place an order!";

    // DO NOT send redundant products array when single product match is found!
    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'product' => $p,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'db_product_found'
    ]);
    exit;
}

// CASE B: Direct Scraped Product Match from Knowledge Base
if ($topKbProd && $topKbProd['score'] >= 12) {
    $kp = $topKbProd['product'];
    $priceFormatted = "₹" . number_format($kp['base_price'], 2);

    $reply = "I found this item in our studio knowledge base records for '{$kp['title']}':\n\n" .
             "• Product Name: {$kp['title']}\n" .
             "• Price: {$priceFormatted}\n" .
             "• Source: Scraped Studio Catalog\n\n" .
             "Would you like further specifications or assistance placing an order?";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'product' => $kp,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'kb_product_found'
    ]);
    exit;
}

// CASE C: General Knowledge Base Text Answer / Snippet
if ($topKbSnippet && $topKbSnippet['score'] >= 10) {
    $reply = "Here is what our studio knowledge base says regarding '{$topKbSnippet['title']}':\n\n" .
             $topKbSnippet['snippet'] . "\n\nNeed any additional specifications or studio recommendations?";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'kb_snippet_found'
    ]);
    exit;
}

// CASE D: Category / Catalog Overview (Multiple Items)
if (!empty($matchedDbProducts) && count($matchedDbProducts) > 1) {
    $topCategoryProds = array_map(function($x) { return $x['product']; }, array_slice($matchedDbProducts, 0, 6));

    $reply = "Here are top-rated studio items matching your request:\n\n";
    foreach ($topCategoryProds as $idx => $p) {
        $pPrice = "₹" . number_format($p['offer_price'] ?: $p['base_price'], 2);
        $reply .= ($idx + 1) . ". {$p['title']} — {$pPrice} ({$p['category']})\n";
    }

    $reply .= "\nExplore the cards below or ask for specific product details!";

    echo json_encode([
        'sender' => 'Alex - TatRabbit Advisor',
        'reply' => $reply,
        'products' => $topCategoryProds,
        'whatsapp_url' => $whatsappUrl,
        'action' => 'catalog_list'
    ]);
    exit;
}

// CASE E: Fallback
$reply = "No matching records found in our studio database for '{$message}'.\n\n" .
         "• Try searching with specific product names (e.g. 'Eternal Ink', 'Maxx Wireless Pen', 'Piercing Needles', 'Stencil Gel').\n" .
         "• Ask about company details (e.g. 'Where are you located?', 'Warranty policy').\n" .
         "• For order tracking, enter your Order ID (e.g. #1 or ATS-1004) or AWB tracking number.";

echo json_encode([
    'sender' => 'Alex - TatRabbit Advisor',
    'reply' => $reply,
    'whatsapp_url' => $whatsappUrl,
    'action' => 'no_match'
]);


// -------------------------------------------------------------
// HELPER FUNCTIONS
// -------------------------------------------------------------

function calculateMatchScore($targetText, $queryWords) {
    if (empty($queryWords) || empty($targetText)) return 0;
    $textLower = strtolower($targetText);
    $score = 0;

    foreach ($queryWords as $qw) {
        if (strlen($qw) < 2) continue;
        if (strpos($textLower, $qw) !== false) {
            $score += (strlen($qw) >= 4) ? 15 : 8;
        }
    }
    return $score;
}

function extractSmartSnippet($content, $queryWords, $maxLength = 500) {
    $cleanText = preg_replace('/--- STRUCTURED SCRAPED PRODUCTS ---.*?--- END STRUCTURED PRODUCTS ---/s', '', $content);
    $cleanText = trim(preg_replace('/\s+/', ' ', $cleanText));

    if (empty($queryWords)) {
        return substr($cleanText, 0, $maxLength);
    }

    $paragraphs = explode("\n", $cleanText);
    $bestParagraph = "";
    $bestScore = 0;

    foreach ($paragraphs as $p) {
        $pClean = trim($p);
        if (strlen($pClean) < 15) continue;
        
        $pLower = strtolower($pClean);
        $score = 0;
        foreach ($queryWords as $qw) {
            if (strlen($qw) >= 2 && strpos($pLower, $qw) !== false) {
                $score += (strlen($qw) >= 4) ? 10 : 5;
            }
        }
        
        if ($score > $bestScore) {
            $bestScore = $score;
            $bestParagraph = $pClean;
        }
    }

    if ($bestScore > 0 && strlen($bestParagraph) >= 20) {
        return strlen($bestParagraph) > $maxLength ? substr($bestParagraph, 0, $maxLength) . '...' : $bestParagraph;
    }

    $contentLower = strtolower($cleanText);
    $firstPos = false;
    foreach ($queryWords as $qw) {
        if (strlen($qw) >= 3) {
            $pos = strpos($contentLower, $qw);
            if ($pos !== false) {
                $firstPos = $pos;
                break;
            }
        }
    }

    if ($firstPos !== false) {
        $start = max(0, $firstPos - 40);
        $snippet = substr($cleanText, $start, $maxLength);
        $prefix = ($start > 0) ? "... " : "";
        $suffix = (strlen($cleanText) > ($start + $maxLength)) ? " ..." : "";
        return $prefix . trim($snippet) . $suffix;
    }

    return strlen($cleanText) > $maxLength ? substr($cleanText, 0, $maxLength) . '...' : $cleanText;
}
