import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Lock, 
  CreditCard, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Landmark, 
  CheckCircle2, 
  ShieldCheck,
  Edit3,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Clock,
  AlertTriangle,
  PackagePlus,
  Package,
  Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { razorpayService } from '../services/razorpayService';
import { OrderSummaryCard } from '../components/cards/OrderSummaryCard';
import { AddProductModal } from '../components/modals/AddProductModal';
import { SEO } from '../components/common/SEO';
import { cleanProductImageUrl } from '../utils/imageUrl';
import api from '../services/api';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

export const Checkout = () => {
  const { user, isAuthenticated } = useAuth();
  const { cartItems, cartTotal, shippingFee, finalTotal: cartFinalTotal, clearCart } = useCart();
  const finalTotal = cartFinalTotal !== undefined ? cartFinalTotal : (cartTotal + (shippingFee || 0));
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editOrderId = searchParams.get('edit_order_id');

  // Edit Order Mode States
  const isEditMode = Boolean(editOrderId);
  const [editOrderData, setEditOrderData] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [originalPaid, setOriginalPaid] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(null);
  const [editExpired, setEditExpired] = useState(false);
  const [fetchingEditOrder, setFetchingEditOrder] = useState(Boolean(editOrderId));
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  // Mobile scroll tracking
  const [isAtPlace, setIsAtPlace] = useState(false);
  const staticButtonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!staticButtonRef.current) return;
      const rect = staticButtonRef.current.getBoundingClientRect();
      const reached = rect.top <= window.innerHeight - 20;
      setIsAtPlace(reached);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // User & Contact Details
  const [shippingName, setShippingName] = useState(user?.name || '');
  const [shippingEmail, setShippingEmail] = useState(user?.email || '');
  const [shippingPhone, setShippingPhone] = useState(user?.phone || '');

  // Address Details
  const [shippingStreet, setShippingStreet] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingDistrict, setShippingDistrict] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to parse address strings formatted as "Street, City, Dist: X, State: Y, PIN: Z"
  const parseAddressString = (addrStr = '') => {
    let pin = '';
    let state = '';
    let dist = '';
    let city = '';
    let street = '';

    const pinMatch = addrStr.match(/PIN:\s*(\d{6})/i) || addrStr.match(/\b(\d{6})\b/);
    if (pinMatch) pin = pinMatch[1];

    const stateMatch = addrStr.match(/State:\s*([^,]+)/i);
    if (stateMatch) state = stateMatch[1].trim();

    const distMatch = addrStr.match(/Dist:\s*([^,]+)/i);
    if (distMatch) dist = distMatch[1].trim();

    const cleaned = addrStr
      .replace(/PIN:\s*\d{6}/i, '')
      .replace(/State:\s*[^,]+/i, '')
      .replace(/Dist:\s*[^,]+/i, '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (cleaned.length > 1) {
      city = cleaned[cleaned.length - 1];
      street = cleaned.slice(0, -1).join(', ');
    } else if (cleaned.length === 1) {
      street = cleaned[0];
    }

    return { pin, state, dist, city, street };
  };

  // If in Edit Order mode, fetch the order details and pre-populate
  useEffect(() => {
    if (!editOrderId) return;

    const loadOrderToEdit = async () => {
      setFetchingEditOrder(true);
      setErrorMessage('');
      try {
        const data = await orderService.getOrderForEdit(editOrderId);
        if (!data.is_within_12_hours) {
          setEditExpired(true);
          setErrorMessage('This order was placed more than 12 hours ago and cannot be modified online.');
          return;
        }

        setEditOrderData(data.order);
        setOriginalPaid(parseFloat(data.order.total_amount || 0));
        setHoursRemaining(data.hours_remaining);

        // Populate items
        const formattedItems = (data.items || []).map(it => ({
          product_id: Number(it.product_id),
          variant_id: it.variant_id ? Number(it.variant_id) : null,
          title: it.title,
          variant_name: it.variant_name,
          unit_price: parseFloat(it.unit_price || 0),
          quantity: Number(it.quantity || 1),
          image_url: it.image_url,
          stock: Number(it.base_stock || 99)
        }));
        setEditItems(formattedItems);

        // Prepopulate shipping information
        if (data.order.shipping_name) setShippingName(data.order.shipping_name);
        if (data.order.shipping_phone) setShippingPhone(data.order.shipping_phone);
        if (data.order.shipping_address) {
          const parsed = parseAddressString(data.order.shipping_address);
          if (parsed.street) setShippingStreet(parsed.street);
          if (parsed.city) setShippingCity(parsed.city);
          if (parsed.dist) setShippingDistrict(parsed.dist);
          if (parsed.state) setShippingState(parsed.state);
          if (parsed.pin) setShippingPincode(parsed.pin);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'Failed to load order for editing.');
        setEditExpired(true);
      } finally {
        setFetchingEditOrder(false);
      }
    };

    if (isAuthenticated) {
      loadOrderToEdit();
    }
  }, [editOrderId, isAuthenticated]);

  // Auth & profile check for regular checkout
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=checkout${editOrderId ? `?edit_order_id=${editOrderId}` : ''}`);
      return;
    }

    if (!isEditMode) {
      const fetchUserProfile = async () => {
        try {
          const res = await api.get('/auth/profile.php');
          if (res.data?.user) {
            if (!shippingName && res.data.user.name) setShippingName(res.data.user.name);
            if (!shippingEmail && res.data.user.email) setShippingEmail(res.data.user.email);
            if (!shippingPhone && res.data.user.phone) setShippingPhone(res.data.user.phone);
          }
        } catch (err) {
          if (user) {
            if (!shippingName && user.name) setShippingName(user.name);
            if (!shippingEmail && user.email) setShippingEmail(user.email);
            if (!shippingPhone && user.phone) setShippingPhone(user.phone);
          }
        }
      };
      fetchUserProfile();
    }
  }, [isAuthenticated, isEditMode, editOrderId, navigate]);

  // If in regular checkout and cart is empty, redirect to cart
  if (!isEditMode && cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  // Edit Mode Item Steppers
  const handleEditQty = (productId, variantId, delta) => {
    setEditItems(prev => {
      return prev.map(item => {
        if (item.product_id === productId && item.variant_id === variantId) {
          const nextQty = item.quantity + delta;
          if (nextQty <= 0) return null;
          return { ...item, quantity: nextQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveEditItem = (productId, variantId) => {
    setEditItems(prev => {
      const filtered = prev.filter(item => !(item.product_id === productId && item.variant_id === variantId));
      if (filtered.length === 0) {
        setErrorMessage('An order must contain at least 1 item. If you wish to cancel this order completely, please use the Cancel Order button in Order History.');
      }
      return filtered;
    });
  };

  const handleAddProductToEdit = (newItem) => {
    setEditItems(prev => {
      const existingIdx = prev.findIndex(
        it => it.product_id === newItem.product_id && it.variant_id === newItem.variant_id
      );
      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }
      return [...prev, newItem];
    });
    setErrorMessage('');
  };

  // Calculations for Edit Mode vs Normal Checkout
  const activeItems = isEditMode ? editItems : cartItems;
  const activeSubtotal = isEditMode 
    ? editItems.reduce((acc, it) => acc + (parseFloat(it.unit_price || 0) * it.quantity), 0)
    : cartTotal;
  const activeShippingFee = activeItems.length > 0 ? (activeSubtotal < 5000 ? 100 : 0) : 0;
  const activeNewTotal = Math.round((activeSubtotal + activeShippingFee) * 100) / 100;

  // "if more price then only show that into the payment checkout page edit order"
  const additionalPrice = isEditMode 
    ? Math.max(0, Math.round((activeNewTotal - originalPaid) * 100) / 100)
    : 0;

  // Excess refund when user edits down to a lower total (e.g., 2500 -> 1400 = 1100 refund)
  const excessRefund = isEditMode 
    ? Math.max(0, Math.round((originalPaid - activeNewTotal) * 100) / 100)
    : 0;

  const totalPayableDisplay = isEditMode ? additionalPrice : finalTotal;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const notifyError = (msg) => {
      setErrorMessage(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isEditMode && editItems.length === 0) {
      notifyError('Please keep at least 1 item in the order or cancel the order if you wish to withdraw it.');
      return;
    }

    // Detailed Validation
    if (!shippingName.trim()) {
      notifyError('Please enter recipient / artist full name');
      return;
    }

    if (!shippingEmail.trim() || !/\S+@\S+\.\S+/.test(shippingEmail.trim())) {
      notifyError('Please enter a valid email address for order confirmation & invoices');
      return;
    }

    const cleanPhone = shippingPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      notifyError('Please enter a valid 10-digit contact mobile number for delivery verification');
      return;
    }

    if (!shippingStreet.trim()) {
      notifyError('Please enter street address / house / flat & landmark');
      return;
    }

    if (!shippingCity.trim()) {
      notifyError('Please enter city or town');
      return;
    }

    if (!shippingDistrict.trim()) {
      notifyError('Please enter district');
      return;
    }

    if (!shippingState) {
      notifyError('Please select delivery state / province');
      return;
    }

    const cleanPincode = shippingPincode.replace(/\D/g, '');
    if (cleanPincode.length !== 6) {
      notifyError('Please enter a valid 6-digit postal PIN code');
      return;
    }

    const formattedAddress = [
      shippingStreet.trim(),
      shippingCity.trim(),
      `Dist: ${shippingDistrict.trim()}`,
      `State: ${shippingState.trim()}`,
      `PIN: ${cleanPincode}`
    ].filter(Boolean).join(', ');

    setLoading(true);

    // ==========================================
    // CASE A: EDIT EXISTING ORDER WITHIN 12 HOURS
    // ==========================================
    if (isEditMode) {
      try {
        const editData = await orderService.initiateOrderEdit(editOrderId, editItems, {
          shipping_name: shippingName.trim(),
          shipping_phone: shippingPhone.trim(),
          shipping_address: formattedAddress
        });

        // If extra price is required, launch Razorpay for ONLY the additional price
        if (editData.requires_payment && editData.additional_amount > 0) {
          await razorpayService.openCheckoutModal({
            keyId: editData.key_id,
            amountPaise: editData.amount_paise,
            orderId: editData.order_id,
            razorpayOrderId: editData.razorpay_order_id,
            customerName: shippingName.trim(),
            customerEmail: shippingEmail.trim(),
            customerPhone: shippingPhone.trim(),

            onSuccess: async (razorpayResponse) => {
              try {
                await orderService.verifyOrderEdit(
                  editOrderId,
                  razorpayResponse.razorpay_order_id,
                  razorpayResponse.razorpay_payment_id,
                  razorpayResponse.razorpay_signature,
                  editItems,
                  {
                    shipping_name: shippingName.trim(),
                    shipping_phone: shippingPhone.trim(),
                    shipping_address: formattedAddress
                  }
                );

                setLoading(false);
                navigate(`/orders?edit_success=true&order_id=${editData.order_number || editOrderId}`);
              } catch (verifyErr) {
                setErrorMessage('Payment verification error: ' + (verifyErr.response?.data?.error || verifyErr.message));
                setLoading(false);
              }
            },

            onDismiss: () => {
              setLoading(false);
              setErrorMessage('Payment of additional price was cancelled. Your previous order details remain unchanged.');
            }
          });
        } else {
          // No additional payment required - updated directly
          setLoading(false);
          const refundParam = editData.refund_amount > 0 ? `&refund=${encodeURIComponent(editData.refund_amount)}` : '';
          navigate(`/orders?edit_success=true&order_id=${editData.order_number || editOrderId}${refundParam}`);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.error || 'Failed to update order. Please check item stock.');
        setLoading(false);
      }
      return;
    }

    // ==========================================
    // CASE B: STANDARD NEW ORDER CHECKOUT
    // ==========================================
    try {
      const orderData = await orderService.createOrder(cartItems, {
        shipping_name: shippingName.trim(),
        shipping_phone: shippingPhone.trim(),
        shipping_address: formattedAddress
      });

      const { order_id, razorpay_order_id, amount_paise, key_id } = orderData;

      await razorpayService.openCheckoutModal({
        keyId: key_id,
        amountPaise: amount_paise,
        orderId: order_id,
        razorpayOrderId: razorpay_order_id,
        customerName: shippingName.trim(),
        customerEmail: shippingEmail.trim(),
        customerPhone: shippingPhone.trim(),

        onSuccess: async (razorpayResponse) => {
          try {
            await orderService.verifyOrder(
              razorpayResponse.razorpay_order_id,
              razorpayResponse.razorpay_payment_id,
              razorpayResponse.razorpay_signature,
              order_id
            );

            setLoading(false);
            clearCart();
            navigate(`/orders?success=true&order_id=${orderData.order_number || order_id}`);
          } catch (verifyErr) {
            setErrorMessage('Payment verification error: ' + (verifyErr.response?.data?.error || verifyErr.message));
            setLoading(false);
          }
        },

        onDismiss: () => {
          setLoading(false);
          setErrorMessage('Payment process was cancelled. You can retry payment anytime.');
        }
      });
    } catch (err) {
      setErrorMessage('Failed to initiate order: ' + (err.response?.data?.error || err.message));
      setLoading(false);
    }
  };

  // If loading order details for edit
  if (fetchingEditOrder) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
        <h2 className="font-heading font-semibold text-base text-slate-800">Retrieving Order #{editOrderId}...</h2>
        <p className="text-xs text-slate-400">Verifying 12-hour instant modification window and stock reserves</p>
      </div>
    );
  }

  // If order modification expired (> 12 hours)
  if (editExpired) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 font-sans text-center space-y-5 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-lg text-slate-900">Modification Window Closed</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Order #{editOrderId} was placed more than 12 hours ago and cannot be modified online. Fulfillment is already in progress.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Order History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 py-6 sm:py-8 px-4 font-sans pb-28 lg:pb-8">
      <SEO 
        title={isEditMode ? `Edit Order #${editOrderId} - TatRabbit` : "Studio Express Checkout - TatRabbit"} 
        description="Complete secure checkout and shipping details for professional tattoo equipment dispatch."
      />

      {/* Top Header */}
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-heading font-semibold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit3 className="w-5 h-5 text-blue-600" /> Modify Order #{editOrderData?.order_number || editOrderId}
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-blue-600" /> Express Checkout
              </>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEditMode
              ? 'Update equipment items, quantities, or delivery address within your 12-hour window'
              : 'Complete verified recipient & shipping details for express courier dispatch'}
          </p>
        </div>

        {isEditMode && (
          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl font-medium transition-colors self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel Edit
          </Link>
        )}
      </div>

      {/* 12-Hour Modification Banner */}
      {isEditMode && hoursRemaining !== null && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
              <Clock className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-semibold text-xs text-slate-900">
                12-Hour Order Modification Window Active
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Approx. <strong>{hoursRemaining} hours remaining</strong> to modify equipment or shipping destination.
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block">Previously Paid</span>
            <span className="font-heading font-semibold text-sm text-slate-900">
              ₹{originalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            
            {/* IN EDIT MODE: Step 1 - Equipment Items Editor */}
            {isEditMode && (
              <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-slate-500" /> Equipment in Order #{editOrderData?.order_number || editOrderId}
                      </h3>
                      <p className="text-[11px] text-slate-400">Increase, decrease, remove items, or add new equipment</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <PackagePlus className="w-3.5 h-3.5" /> Add Equipment
                  </button>
                </div>

                {editItems.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl space-y-2">
                    <p className="text-xs text-slate-500">No equipment in this order.</p>
                    <button
                      type="button"
                      onClick={() => setIsAddProductOpen(true)}
                      className="text-xs font-semibold text-blue-600 underline"
                    >
                      Click here to add equipment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                            {cleanProductImageUrl(item.image_url) ? (
                              <img
                                src={cleanProductImageUrl(item.image_url)}
                                alt={item.title}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                              />
                            ) : null}
                            <div className={`${cleanProductImageUrl(item.image_url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                              <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-xs text-slate-900 truncate">{item.title}</h4>
                            {item.variant_name && (
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded">
                                {item.variant_name}
                              </span>
                            )}
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className={`text-[11px] font-semibold ${item.applied_coupon ? 'text-emerald-600 font-bold' : 'text-slate-600'}`}>
                                ₹{item.unit_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })} each
                              </span>
                              {item.applied_coupon && (
                                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                  {item.applied_coupon.code}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-200 pt-2 sm:pt-0">
                          {/* Stepper */}
                          <div className="flex items-center border border-slate-200 bg-white rounded-xl overflow-hidden shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleEditQty(item.product_id, item.variant_id, -1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Decrease Quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-semibold text-slate-900 font-mono">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleEditQty(item.product_id, item.variant_id, 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Increase Quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right min-w-[75px]">
                            <span className="font-heading font-semibold text-xs text-slate-900">
                              ₹{(item.unit_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>

                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveEditItem(item.product_id, item.variant_id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove item from order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step: Recipient & Contact Details */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {isEditMode ? 2 : 1}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-500" /> Customer & Contact Details
                  </h3>
                  <p className="text-[11px] text-slate-400">Order invoices, dispatch alerts, and courier OTPs will be sent here</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Recipient Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      placeholder="e.g. Vikram Sethi"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address (For Tax Invoices) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={shippingEmail}
                      onChange={(e) => setShippingEmail(e.target.value)}
                      placeholder="e.g. artist@studio.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contact Mobile Number (For Delivery Partner) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      maxLength={15}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Courier will contact this number upon out-for-delivery arrival</span>
                </div>
              </div>
            </div>

            {/* Step: Delivery Address */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 sm:p-7 space-y-5 shadow-xs">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3.5">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {isEditMode ? 3 : 2}
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-500" /> Delivery Address
                  </h3>
                  <p className="text-[11px] text-slate-400">Specify complete house/flat, street, city, district, and pincode</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Street Address / House / Flat & Landmark *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={shippingStreet}
                    onChange={(e) => setShippingStreet(e.target.value)}
                    placeholder="e.g. Flat #4, 2nd Floor, Opp. City Center Mall, MG Road"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      placeholder="e.g. Ahmedabad"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      District *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingDistrict}
                      onChange={(e) => setShippingDistrict(e.target.value)}
                      placeholder="e.g. Ahmedabad District"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      State / Province *
                    </label>
                    <select
                      required
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer font-medium"
                    >
                      <option value="">-- Select Indian State / UT --</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Postal PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={shippingPincode}
                      onChange={(e) => setShippingPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 380001"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step: Payment Gateway Summary Card */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-6 space-y-3.5 shadow-xs">
              <h3 className="font-heading font-semibold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" /> {isEditMode ? 4 : 3}. Secure Payment Summary
              </h3>
              
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-800 block">
                    {isEditMode 
                      ? (additionalPrice > 0 ? 'Additional Price Difference' : 'Order Fully Covered') 
                      : 'Instant Payment Checkout'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {isEditMode
                      ? (additionalPrice > 0 
                          ? `You will only be charged the difference of ₹${additionalPrice.toFixed(2)} via UPI or Card.`
                          : 'Your modified order is covered by your previous payment. No extra charge is due.')
                      : 'Supports UPI (Google Pay, PhonePe, Paytm), NetBanking, Credit/Debit Cards, and EMI.'}
                  </span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  isEditMode && additionalPrice === 0 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {isEditMode 
                    ? (additionalPrice > 0 ? `+₹${additionalPrice.toFixed(2)} Due` : '₹0 Due') 
                    : 'Instant Processing'}
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Order Summary Card */}
          <div className="space-y-4">
            <OrderSummaryCard 
              cartItems={activeItems} 
              cartTotal={activeSubtotal} 
              shippingFee={activeShippingFee}
              isEditMode={isEditMode}
              originalPaid={originalPaid}
              additionalPrice={additionalPrice}
            >
              <div ref={staticButtonRef} className="pt-2">
                <button
                  type="submit"
                  disabled={loading || (isEditMode && editItems.length === 0)}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-60 text-white font-semibold text-sm py-3.5 sm:py-4 rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : isEditMode ? (
                    additionalPrice > 0 ? (
                      <>
                        <Lock className="w-4 h-4" /> Pay Difference (₹{additionalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) & Update
                      </>
                    ) : excessRefund > 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Save & Request ₹{excessRefund.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Refund Payout
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" /> Save & Update Order
                      </>
                    )
                  ) : (
                    <>
                      <Lock className="w-4 h-4" /> Pay & Place Order
                    </>
                  )}
                </button>
              </div>
            </OrderSummaryCard>
          </div>

        </div>

        {/* Fixed Mobile Bottom Bar */}
        <div
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-8px_25px_rgba(0,0,0,0.12)] px-4 py-3 sm:px-6 transition-all duration-300 ease-in-out ${
            isAtPlace 
              ? 'opacity-0 translate-y-full pointer-events-none' 
              : 'opacity-100 translate-y-0 pointer-events-auto'
          }`}
        >
          <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block leading-tight">
                {isEditMode ? (excessRefund > 0 ? 'Refund Due' : 'Additional Due') : 'Total Payable'}
              </span>
              <div className="flex items-baseline gap-1.5 truncate">
                <span className="text-base sm:text-lg font-heading font-bold text-slate-900 tracking-tight">
                  ₹{totalPayableDisplay.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 ${
                  isEditMode && excessRefund > 0
                    ? 'text-amber-800 bg-amber-100'
                    : (isEditMode && additionalPrice === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-blue-700 bg-blue-50')
                }`}>
                  {isEditMode 
                    ? (additionalPrice > 0 ? 'Difference' : (excessRefund > 0 ? `₹${excessRefund} Refund Due` : 'Fully Covered'))
                    : (shippingFee === 0 ? 'Free Delivery' : '+₹100')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (isEditMode && editItems.length === 0)}
              className="flex-1 max-w-[200px] sm:max-w-[230px] bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white font-semibold text-xs sm:text-sm py-3 px-3.5 rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
                  <span>Processing...</span>
                </>
              ) : isEditMode ? (
                additionalPrice > 0 ? (
                  <>
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Pay Difference & Save</span>
                  </>
                ) : excessRefund > 0 ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Save & Request Refund</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Save Changes</span>
                  </>
                )
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Pay & Place Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Add Product Modal for Edit Order Mode */}
      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onAddProduct={handleAddProductToEdit}
        existingItems={editItems}
      />
    </div>
  );
};
