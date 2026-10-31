import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  PhoneCall,
  ExternalLink,
  Loader2,
  Sparkles,
  ShoppingBag,
  Truck,
  MapPin,
  CreditCard,
  Hash,
  Search,
  Box,
  PackageSearch,
  ShieldCheck,
  Zap,
  RotateCcw,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import logoImg from '../../assets/logo.jpeg';

export const ChatDrawer = () => {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTrackForm, setShowTrackForm] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      name: 'Alex - TatRabbit Advisor',
      text: "Hey artist! I'm Alex, your TatRabbit AI Advisor.\n\nI can assist you with:\n• Searching Equipment Specs, Inks & Needles\n• Live Order Tracking by Order # or AWB Number\n• Full Product Details, Prices, Stock & Variants\n• Studio Shipping & Return Policy Details",
      isTyping: false
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && hasStartedChat) scrollToBottom();
  }, [messages, isOpen, showTrackForm, hasStartedChat, loading]);

  const handleSendMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const userText = (customText || inputMessage).trim();
    if (!userText || loading) return;

    if (!hasStartedChat) setHasStartedChat(true);

    setInputMessage('');
    setShowTrackForm(false);
    setMessages(prev => [...prev, { sender: 'user', text: userText, isTyping: false }]);
    setLoading(true);

    try {
      const response = await api.post('/support/chatbot.php', { message: userText });
      const data = response.data;

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          name: data.sender || 'Alex - TatRabbit Advisor',
          text: data.reply,
          whatsapp_url: data.whatsapp_url,
          order: data.order,
          product: data.product,
          products: data.products,
          isTyping: true // Trigger live typewriter animation for new bot response
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          name: 'Alex - TatRabbit Advisor',
          text: "I experienced a momentary connection issue. Please submit an online inquiry or try again in a moment.",
          isTyping: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackFormSubmit = (e) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const q = trackQuery.trim();
    setTrackQuery('');
    setShowTrackForm(false);
    handleSendMessage(null, `Track order ${q}`);
  };

  const handlePresetClick = (presetType) => {
    if (!hasStartedChat) setHasStartedChat(true);

    if (presetType === 'track') {
      setShowTrackForm(true);
    } else {
      setShowTrackForm(false);
      handleSendMessage(null, presetType);
    }
  };

  const handleResetChat = () => {
    setHasStartedChat(false);
    setShowTrackForm(false);
    setMessages([
      {
        sender: 'bot',
        name: 'Alex - TatRabbit Advisor',
        text: "Hey artist! I'm Alex, your TatRabbit AI Advisor.\n\nI can assist you with:\n• Searching Equipment Specs, Inks & Needles\n• Live Order Tracking by Order # or AWB Number\n• Full Product Details, Prices, Stock & Variants\n• Studio Shipping & Return Policy Details",
        isTyping: false
      }
    ]);
  };

  const renderLinksInString = (str, isUser = false) => {
    if (!str) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = str.split(urlRegex);

    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className={`${isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'} underline font-semibold inline-flex items-center gap-0.5 break-all`}
          >
            {part} <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        );
      }
      return part;
    });
  };

  // Clean, natural chat typography formatting
  const renderFormattedText = (text, isUser = false) => {
    if (!text) return null;

    if (isUser) {
      return <p className="leading-relaxed font-semibold text-white text-xs sm:text-[13px]">{text}</p>;
    }

    const lines = text.split('\n');

    return (
      <div className="space-y-1 text-slate-800 text-xs sm:text-[13px] font-normal leading-relaxed">
        {lines.map((line, lineIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lineIdx} className="h-1" />;

          if (trimmed.startsWith('•')) {
            const content = trimmed.substring(1).trim();
            return (
              <div key={lineIdx} className="flex items-start gap-2 py-0.5 text-slate-800 font-normal">
                <span className="text-blue-600 font-semibold text-sm flex-shrink-0 leading-none mt-0.5">•</span>
                <div className="flex-1 min-w-0 leading-relaxed">{renderLinksInString(content, false)}</div>
              </div>
            );
          }

          return (
            <p key={lineIdx} className="leading-relaxed text-slate-800 font-normal">
              {renderLinksInString(trimmed, false)}
            </p>
          );
        })}
      </div>
    );
  };

  // Typewriter Text Effect Component for Bot Responses
  const TypewriterText = ({ text, isUser, onComplete, speed = 20 }) => {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {
      indexRef.current = 0;
      setDisplayedText('');

      if (isUser || !text) {
        setDisplayedText(text || '');
        if (onComplete) onComplete();
        return;
      }

      const timer = setInterval(() => {
        if (indexRef.current < text.length) {
          const nextIndex = indexRef.current + 1;
          setDisplayedText(text.slice(0, nextIndex));
          indexRef.current = nextIndex;
          scrollToBottom();
        } else {
          clearInterval(timer);
          if (onComplete) onComplete();
        }
      }, speed);

      return () => clearInterval(timer);
    }, [text, isUser, speed]);

    return renderFormattedText(displayedText, isUser);
  };

  const getTimelineStep = (status) => {
    const s = (status || 'ordered').toLowerCase().replace(/[\s-]/g, '_');
    if (s === 'delivered') return 4;
    if (s === 'out_for_delivery' || s === 'shipped') return 3;
    if (s === 'processing') return 2;
    return 1;
  };

  return (
    <>
      {/* Animated Floating Launcher Button */}
      <div className={`fixed ${isCheckout ? 'bottom-[4.75rem] sm:bottom-6' : 'bottom-4 sm:bottom-6'} right-4 sm:right-6 z-50 ${isOpen ? 'hidden sm:flex' : 'flex'} items-center gap-3`}>
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-slate-200/90 animate-slide-left cursor-pointer hover:bg-blue-50/80 transition-all group select-none"
          >
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
            <span className="text-slate-900 font-heading tracking-tight group-hover:text-blue-600 transition-colors">Studio AI Advisor</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin flex-shrink-0" style={{ animationDuration: '4s' }} />
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 border-2 border-white/30 transition-all duration-300 hover:scale-105 active:scale-95 ${!isOpen ? 'animate-pulse-glow' : ''}`}
          aria-label="Toggle Studio AI Advisor"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 rotate-90" />
          ) : (
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300" />
          )}

          {!isOpen && (
            <span className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-400 border-2 border-white rounded-full absolute top-0 right-0 shadow-xs">
              <span className="w-full h-full bg-emerald-400 rounded-full absolute top-0 left-0 animate-ping opacity-75"></span>
            </span>
          )}
        </button>
      </div>

      {/* Chat Drawer Window */}
      {isOpen && (
        <div className={`fixed inset-x-3 ${isCheckout ? 'bottom-[4.75rem] sm:bottom-24' : 'bottom-3 sm:bottom-24'} sm:left-auto sm:right-6 sm:w-[420px] h-[520px] sm:h-[600px] max-h-[78vh] sm:max-h-[82vh] bg-white border border-slate-200/90 rounded-2xl sm:rounded-[1.75rem] shadow-2xl flex flex-col overflow-hidden font-sans z-50 animate-fadeIn`}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-4 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-md text-white border border-white/30 flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-700 rounded-full absolute -bottom-0.5 -right-0.5"></span>
              </div>
              <div>
                <h4 className="text-xs font-heading font-semibold text-white flex items-center gap-1.5">
                  Alex <span className="bg-white/20 text-[9px] px-2 py-0.5 rounded-full font-sans text-blue-100">AI Advisor</span>
                </h4>
                <p className="text-[10px] text-blue-200 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Online • Studio Gear & Order Tracking
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasStartedChat && (
                <button
                  onClick={handleResetChat}
                  title="Restart Welcome Screen"
                  className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Welcome Screen vs Active Chat */}
          {!hasStartedChat ? (
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-b from-slate-50 via-blue-50/20 to-white flex flex-col justify-between custom-thin-scrollbar animate-fadeIn">
              
              <div className="text-center space-y-3 pt-3">
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto border-2 border-white">
                    <Bot className="w-9 h-9" />
                  </div>
                  <span className="w-4 h-4 bg-emerald-400 border-2 border-white rounded-full absolute bottom-0 right-0 shadow-xs"></span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-base font-heading font-semibold text-slate-900 flex items-center justify-center gap-1.5">
                    Welcome to TatRabbit <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
                  </h3>
                  <p className="text-xs text-slate-600 font-medium px-2 leading-relaxed">
                    Hi! I'm Alex, your Studio Assistant. What would you like to explore or track today?
                  </p>
                </div>
              </div>

              {/* Action Cards List */}
              <div className="space-y-2.5 my-4">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">Quick Studio Topics</p>

                <button
                  onClick={() => handlePresetClick('track')}
                  className="w-full text-left bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-md group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <PackageSearch className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">Track Order / AWB Status</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Live courier tracking by Order ID or AWB</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handlePresetClick('show rotary machines')}
                  className="w-full text-left bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-md group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">Rotary Tattoo Machines</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Wireless pens, strokes & motor specs</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handlePresetClick('show inks')}
                  className="w-full text-left bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-md group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">Tattoo Inks & Pigments</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Obsidian black, grey wash & color shades</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>

                <button
                  onClick={() => handlePresetClick('Return and refund policy')}
                  className="w-full text-left bg-white hover:bg-blue-50/70 border border-slate-200/90 hover:border-blue-300 p-3 rounded-2xl transition-all shadow-2xs hover:shadow-md group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">Refund & Return Policy</h4>
                      <p className="text-[11px] text-slate-500 font-medium">Return requests within 48 hrs & refund details</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </button>
              </div>

              <div className="text-center pt-2 border-t border-slate-200/60">
                <span className="text-[10px] text-slate-400 font-medium inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-500" /> Powered by TatRabbit AI Knowledge Base
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/80 custom-thin-scrollbar animate-fadeIn">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[88%] ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white font-semibold rounded-2xl rounded-tr-xs shadow-xs'
                      : 'bg-white text-slate-900 border border-slate-200/90 rounded-2xl rounded-tl-xs shadow-xs font-normal'
                  } px-4 py-3 text-xs sm:text-[13px] leading-relaxed space-y-3`}>
                    
                    <div>
                      {msg.sender === 'bot' && msg.isTyping ? (
                        <TypewriterText
                          text={msg.text}
                          isUser={false}
                          onComplete={() => {
                            setMessages(prev =>
                              prev.map((m, idx) => (idx === index ? { ...m, isTyping: false } : m))
                            );
                          }}
                        />
                      ) : (
                        renderFormattedText(msg.text, msg.sender === 'user')
                      )}
                    </div>

                    {/* INTERACTIVE ORDER TRACKING CARD */}
                    {msg.order && !msg.isTyping && (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3 text-slate-900 mt-2 animate-fadeIn">
                        
                        <div className="flex justify-between items-center border-b border-slate-200/80 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-semibold">
                              <Box className="w-3.5 h-3.5 text-blue-600" />
                            </div>
                            <div>
                              <h5 className="font-heading font-semibold text-xs text-slate-900">Order #{msg.order.order_number || (`ATS-${1000 + Number(msg.order.id)}`)}</h5>
                              <p className="text-[10px] text-slate-500 font-medium">Verified Studio Order</p>
                            </div>
                          </div>

                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                            msg.order.tracking_status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : msg.order.tracking_status === 'shipped' || msg.order.tracking_status === 'out_for_delivery'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {msg.order.tracking_status?.replace('_', ' ')}
                          </span>
                        </div>

                        {/* 4-Step Progress Bar */}
                        <div className="bg-white rounded-xl p-2 border border-slate-200/80">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600 mb-1 px-1">
                            <span className={getTimelineStep(msg.order.tracking_status) >= 1 ? 'text-blue-600 font-semibold' : ''}>Ordered</span>
                            <span className={getTimelineStep(msg.order.tracking_status) >= 2 ? 'text-blue-600 font-semibold' : ''}>Processing</span>
                            <span className={getTimelineStep(msg.order.tracking_status) >= 3 ? 'text-blue-600 font-semibold' : ''}>Shipped</span>
                            <span className={getTimelineStep(msg.order.tracking_status) >= 4 ? 'text-emerald-600 font-semibold' : ''}>Delivered</span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
                              style={{
                                width:
                                  getTimelineStep(msg.order.tracking_status) === 1 ? '25%' :
                                  getTimelineStep(msg.order.tracking_status) === 2 ? '50%' :
                                  getTimelineStep(msg.order.tracking_status) === 3 ? '75%' : '100%'
                              }}
                            />
                          </div>
                        </div>

                        {/* Logistics Details */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                              <Truck className="w-3 h-3 text-blue-600" /> Courier
                            </span>
                            <p className="font-semibold text-slate-900 truncate">{msg.order.courier_name || 'Bluedart Express'}</p>
                          </div>

                          <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-0.5">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                              <Hash className="w-3 h-3 text-purple-600" /> AWB Number
                            </span>
                            <p className="font-semibold text-slate-900 truncate font-mono text-[10px]">{msg.order.tracking_number || 'Pending'}</p>
                          </div>
                        </div>

                        {msg.order.tracking_url && (
                          <div className="pt-1">
                            <a
                              href={msg.order.tracking_url}
                              target="_blank"
                              rel="noreferrer"
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                            >
                              <Truck className="w-4 h-4" /> Open Courier Live Tracking <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}

                      </div>
                    )}

                    {/* SINGLE FEATURED PRODUCT DETAILS CARD */}
                    {msg.product && !msg.isTyping && (
                      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 space-y-2.5 text-xs text-slate-900 mt-2 animate-fadeIn">
                        <div className="flex items-center gap-3">
                          {msg.product.image_url && (
                            <img
                              src={msg.product.image_url}
                              alt={msg.product.title}
                              className="w-14 h-14 object-contain rounded-xl flex-shrink-0 border border-slate-200 shadow-2xs bg-white p-1"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-slate-900 truncate">{msg.product.title}</h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-heading font-semibold text-blue-600 text-sm">
                                ₹{parseFloat(msg.product.offer_price || msg.product.base_price || 0).toLocaleString('en-IN')}
                              </span>
                              {msg.product.offer_price && (
                                <span className="text-[10px] text-slate-400 line-through">
                                  ₹{parseFloat(msg.product.base_price).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {msg.product.category || 'Tattoo Equipment'}
                              {msg.product.stock !== undefined ? ` • ${msg.product.stock > 0 ? 'In Stock' : 'Out of Stock'}` : ''}
                            </span>
                          </div>
                        </div>

                        {msg.product.variants && msg.product.variants.length > 0 && (
                          <div className="border-t border-slate-200/80 pt-2 space-y-1 text-[11px]">
                            <span className="font-semibold text-slate-700 block text-[10px] uppercase tracking-wider">Available Variants & Options:</span>
                            <div className="space-y-1 max-h-32 overflow-y-auto custom-thin-scrollbar">
                              {msg.product.variants.map((v) => (
                                <div key={v.id} className="flex justify-between items-center bg-white px-2.5 py-1 rounded-lg border border-slate-200/80 text-[10px]">
                                  <span className="font-semibold text-slate-800 truncate pr-2">{v.name}</span>
                                  <span className="font-semibold text-blue-600 font-heading flex-shrink-0">₹{parseFloat(v.price).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-1 flex justify-end">
                          <Link
                            to={`/product/${msg.product.slug || msg.product.id}`}
                            onClick={() => setIsOpen(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-all active:scale-95"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> View Product Specs &rarr;
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* MULTI-PRODUCT CAROUSEL SLIDER */}
                    {msg.products && msg.products.length > 0 && !msg.isTyping && (
                      <div className="space-y-2 pt-1 mt-2 animate-fadeIn">
                        <span className="text-[10px] font-semibold uppercase text-slate-500 tracking-wider block">
                          Matched Studio Gear ({msg.products.length}):
                        </span>
                        <div className="flex gap-2.5 overflow-x-auto pb-2 custom-thin-scrollbar snap-x">
                          {msg.products.map((prod) => (
                            <div
                              key={prod.id}
                              className="w-44 flex-shrink-0 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 space-y-2 shadow-2xs snap-start flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="w-full h-20 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                                  {prod.image_url ? (
                                    <img src={prod.image_url} alt={prod.title} className="max-w-full max-h-full object-contain" />
                                  ) : (
                                    <Box className="w-6 h-6 text-slate-300" />
                                  )}
                                </div>
                                <h6 className="font-semibold text-[11px] text-slate-900 line-clamp-2 leading-snug">{prod.title}</h6>
                                <div className="flex items-center justify-between">
                                  <span className="font-heading font-semibold text-xs text-blue-600">
                                    ₹{parseFloat(prod.offer_price || prod.base_price).toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[9px] font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                                    {prod.category}
                                  </span>
                                </div>
                              </div>
                              <Link
                                to={`/product/${prod.slug || prod.id}`}
                                onClick={() => setIsOpen(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] py-1.5 rounded-xl flex items-center justify-center gap-1 transition-all active:scale-95"
                              >
                                <ShoppingBag className="w-3 h-3" /> View Specs
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* WHATSAPP SUPPORT ESCALATION */}
                    {msg.whatsapp_url && !msg.isTyping && (
                      <div className="pt-1.5 border-t border-slate-100">
                        <a
                          href={msg.whatsapp_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-xl text-xs transition-all shadow-xs active:scale-95"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> WhatsApp Support Line <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5 shadow-xs font-semibold">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* TRACK ORDER FORM MODAL CARD */}
              {showTrackForm && (
                <div className="bg-gradient-to-b from-blue-50 to-white border border-blue-200 rounded-2xl p-4 shadow-md space-y-3 font-sans animate-fadeIn">
                  <div className="flex justify-between items-center">
                    <h5 className="font-heading font-semibold text-xs text-blue-900 flex items-center gap-1.5">
                      <PackageSearch className="w-4 h-4 text-blue-600" /> Track Shipment or Order Status
                    </h5>
                    <button onClick={() => setShowTrackForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-[11px] text-slate-700 font-medium">Enter your Order ID (e.g. ATS-1004), AWB Tracking Number, or Mobile Number:</p>

                  <form onSubmit={handleTrackFormSubmit} className="space-y-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={trackQuery}
                        onChange={(e) => setTrackQuery(e.target.value)}
                        placeholder="e.g. TR-1004 or BD78912345IN..."
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs font-semibold rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-blue-600 shadow-2xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    >
                      <Search className="w-3.5 h-3.5" /> Track Order Status Now
                    </button>
                  </form>
                </div>
              )}

              {/* LIVE CHAT TYPING ANIMATION INDICATOR */}
              {loading && (
                <div className="flex gap-2.5 items-center text-slate-500 text-xs animate-fadeIn">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-xs border border-slate-200/90 shadow-xs flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Alex is typing</span>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={(e) => handleSendMessage(e)} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Alex about equipment, inks, or order #..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white text-slate-900 font-medium text-xs sm:text-[13px] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all placeholder-slate-400 shadow-2xs"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold p-3 rounded-2xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex-shrink-0 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

    </>
  );
};
