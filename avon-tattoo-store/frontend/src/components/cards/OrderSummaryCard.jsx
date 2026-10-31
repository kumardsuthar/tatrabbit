import React from 'react';
import { ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { cleanProductImageUrl } from '../../utils/imageUrl';

export const OrderSummaryCard = ({ 
  cartItems, 
  cartTotal, 
  shippingFee: passedShippingFee, 
  isEditMode = false,
  originalPaid = 0,
  additionalPrice = 0,
  children 
}) => {
  const shippingFee = passedShippingFee !== undefined ? passedShippingFee : (cartTotal > 0 && cartTotal < 5000 ? 100 : 0);
  const finalTotal = cartTotal + shippingFee;

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-xs space-y-4 sticky top-28 font-sans">
      <h3 className="font-heading font-semibold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
        <span>Order Summary</span>
        {isEditMode && (
          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full uppercase">
            Order Edit
          </span>
        )}
      </h3>

      {/* Free Delivery Threshold Helper */}
      {!isEditMode && cartTotal > 0 && cartTotal < 5000 ? (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-center justify-between">
          <span>Add <strong>₹{(5000 - cartTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> for <strong>FREE Delivery</strong></span>
          <span className="font-semibold text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded">Standard ₹100</span>
        </div>
      ) : !isEditMode && cartTotal >= 5000 ? (
        <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-xl p-2.5 text-[11px] text-emerald-800 font-medium flex items-center gap-1.5">
          <span>🎉 <strong>FREE Courier Delivery</strong> applied on this order!</span>
        </div>
      ) : null}

      {/* Item List Summary */}
      <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-1 flex-shrink-0">
                {cleanProductImageUrl(item.image_url) ? (
                  <img
                    src={cleanProductImageUrl(item.image_url)}
                    alt={item.title}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                ) : null}
                <div className={`${cleanProductImageUrl(item.image_url) ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-300`}>
                  <ImageIcon className="w-4 h-4 stroke-[1.5]" />
                </div>
              </div>
              <div className="truncate">
                <p className="font-semibold text-slate-900 text-xs truncate">{item.title}</p>
                {item.variant_name && <p className="text-[10px] text-blue-600 font-semibold truncate">{item.variant_name}</p>}
                <p className="text-[10px] text-slate-400">Qty: {item.quantity}</p>
              </div>
            </div>
            <span className="font-semibold text-slate-900 text-xs flex-shrink-0">
              ₹{(item.unit_price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-3 space-y-2 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Equipment Subtotal</span>
          <span className="text-slate-900 font-semibold">₹{cartTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center">
          <div>
            <span>Express Courier Shipping</span>
            {shippingFee > 0 && <span className="text-[10px] text-slate-400 block">(Orders under ₹5,000)</span>}
          </div>
          <span className={shippingFee === 0 ? "text-emerald-600 font-semibold" : "text-slate-900 font-semibold"}>
            {shippingFee === 0 ? 'FREE' : `₹${shippingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Sterilization & Safe Packaging</span>
          <span className="text-emerald-600 font-semibold">INCLUDED</span>
        </div>

        {isEditMode && (
          <div className="pt-2 border-t border-dashed border-slate-200 space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-700">Revised Order Total</span>
              <span className="text-slate-900">₹{finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-medium text-[11px]">
              <span>Previously Paid</span>
              <span>-₹{originalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            {originalPaid > finalTotal && (
              <div className="flex justify-between items-center text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-lg text-[11px]">
                <div>
                  <span className="font-semibold block text-amber-900">Excess Paid (Refund Due)</span>
                  <span className="text-[10px] text-amber-700">Queued for admin manual refund payout</span>
                </div>
                <span className="font-bold text-xs text-amber-900">
                  ₹{(originalPaid - finalTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline">
        <div>
          <span className="text-xs font-semibold text-slate-900 block">
            {isEditMode 
              ? (additionalPrice > 0 ? 'Additional Amount Due' : (originalPaid > finalTotal ? 'Excess Refund Due' : 'Balance Payable'))
              : 'Total Payable'}
          </span>
          <span className="text-[10px] text-slate-400">
            {isEditMode
              ? (additionalPrice > 0 
                  ? 'Payable via Razorpay' 
                  : (originalPaid > finalTotal ? 'Queued for admin payout to original payment method' : 'No extra payment required'))
              : 'Includes all GST taxes'}
          </span>
        </div>
        <span className={`text-xl font-heading font-semibold ${
          isEditMode && originalPaid > finalTotal
            ? 'text-amber-600'
            : (isEditMode && additionalPrice === 0 ? 'text-emerald-600' : 'text-blue-600')
        }`}>
          {isEditMode && originalPaid > finalTotal 
            ? `₹${(originalPaid - finalTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Refund)` 
            : `₹${(isEditMode ? additionalPrice : finalTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
        </span>
      </div>

      <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 flex items-center gap-2.5 text-[11px] text-blue-900 font-medium">
        <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
        <p>256-Bit Encrypted Payment Guarantee</p>
      </div>

      {children && (
        <div className="pt-1">
          {children}
        </div>
      )}
    </div>
  );
};
