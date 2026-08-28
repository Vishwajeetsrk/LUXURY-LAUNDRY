"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../../../../context/CartContext";
import { API_URL } from "@/lib/api";

export default function CartPage() {
  const { cart, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number>(-1);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ building: "", street: "", area: "", pincode: "", mapLink: "" });
  const [whatsappLink, setWhatsappLink] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [useWallet, setUseWallet] = useState(true);
  
  // Offers/Coupons
  const [offers, setOffers] = useState<any[]>([]);
  const [offerInput, setOfferInput] = useState("");
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const [offerError, setOfferError] = useState("");

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login?redirect=/shop/cart");
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.addresses && Array.isArray(data.addresses)) {
            setAddresses(data.addresses);
            if (data.addresses.length > 0) setSelectedAddressIdx(0);
            else setShowNewAddress(true);
          } else {
            setShowNewAddress(true);
          }
          
          // Fetch wallet balance
          const walletRes = await fetch(`${API_URL}/api/wallet/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (walletRes.ok) {
            const walletData = await walletRes.json();
            setWalletBalance(walletData.walletBalance || 0);
          }
        } else {
          router.push("/login?redirect=/shop/cart");
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/offers`);
        if (res.ok) {
          const data = await res.json();
          setOffers(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch offers", err);
      }
    };

    fetchUser();
    fetchOffers();
  }, [router]);

  const handleApplyOffer = () => {
    setOfferError("");
    if (!offerInput.trim()) return;
    
    const matchedOffer = offers.find(o => o.code.toUpperCase() === offerInput.toUpperCase());
    if (!matchedOffer) {
      setOfferError("Invalid or expired offer code.");
      setAppliedOffer(null);
      return;
    }
    if (cartTotal < matchedOffer.minOrderValue) {
      setOfferError(`Minimum order value of ₹${matchedOffer.minOrderValue} required for this code.`);
      setAppliedOffer(null);
      return;
    }
    setAppliedOffer(matchedOffer);
    setOfferInput("");
  };

  const removeOffer = () => {
    setAppliedOffer(null);
  };

  const calculateDiscount = () => {
    if (!appliedOffer) return 0;
    if (appliedOffer.discountType === "PERCENTAGE") {
      const calc = cartTotal * (appliedOffer.discountValue / 100);
      return appliedOffer.maxDiscount ? Math.min(calc, appliedOffer.maxDiscount) : calc;
    }
    return appliedOffer.discountValue;
  };

  const discountAmount = calculateDiscount();
  const subtotalAfterDiscount = Math.max(0, cartTotal - discountAmount);
  const finalDeliveryCharge = subtotalAfterDiscount >= 4999 ? 0 : 100;
  const totalBeforeWallet = subtotalAfterDiscount + finalDeliveryCharge;
  const finalWalletDeduction = useWallet ? Math.min(walletBalance, totalBeforeWallet) : 0;
  const estimatedTotal = Math.max(0, totalBeforeWallet - finalWalletDeduction);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Build the final address string
    let finalAddressStr = "";
    if (showNewAddress) {
      if (!newAddress.building || !newAddress.street || !newAddress.area || !newAddress.pincode) {
        setError("Please fill out all required address fields.");
        setLoading(false);
        return;
      }
      finalAddressStr = `${newAddress.building}, ${newAddress.street}, ${newAddress.area} - ${newAddress.pincode}`;
      if (newAddress.mapLink) finalAddressStr += ` | Map: ${newAddress.mapLink}`;
      
      // Save this new address to the user profile
      try {
        const token = localStorage.getItem("token");
        const updatedAddresses = [...addresses, newAddress];
        await fetch(`${API_URL}/api/customers/me/addresses`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ addresses: updatedAddresses })
        });
        setAddresses(updatedAddresses);
      } catch (err) {
        console.error("Failed to save address", err);
      }
    } else {
      if (selectedAddressIdx < 0 || selectedAddressIdx >= addresses.length) {
        setError("Please select a delivery address.");
        setLoading(false);
        return;
      }
      const addr = addresses[selectedAddressIdx];
      finalAddressStr = `${addr.building}, ${addr.street}, ${addr.area} - ${addr.pincode}`;
      if (addr.mapLink) finalAddressStr += ` | Map: ${addr.mapLink}`;
    }

    try {
      let deliveryChargeApplied = false;
      const deliveryCharge = cartTotal < 4999 ? 100 : 0;

      for (const item of cart) {
        const currentDeliveryCharge = !deliveryChargeApplied ? deliveryCharge : 0;
        deliveryChargeApplied = true;

        const res = await fetch(`${API_URL}/api/orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            serviceId: item.serviceId,
            quantity: item.quantity,
            address: finalAddressStr,
            paymentMethod,
            deliveryInstructions: notes,
            notes: "Ordered via Checkout",
            deliveryCharge: currentDeliveryCharge,
            useWallet: useWallet,
            offerCode: appliedOffer ? appliedOffer.code : undefined
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to place order. Please try again.");
        }
        
        const data = await res.json();
        // Capture whatsapp link if it was QR
        if (paymentMethod === "QR" && data.whatsapp?.admin?.clickUrl) {
           setWhatsappLink(data.whatsapp.admin.clickUrl);
        }
      }

      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <i className="fa-solid fa-check text-4xl text-green-500" />
          </div>
          <div>
            <h2 className="mt-6 text-3xl font-black text-gray-900">Order Placed!</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your laundry order has been successfully placed. Our delivery executive will pick up your items shortly.
            </p>
          </div>
          
          {paymentMethod === "QR" && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <h3 className="font-bold text-yellow-800 mb-2">Almost done!</h3>
              <p className="text-sm text-yellow-700 mb-4">Please share the screenshot of your QR payment via WhatsApp to confirm the order.</p>
              {whatsappLink ? (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  Share Screenshot
                </a>
              ) : (
                <a href={`https://wa.me/919663574728`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  Message Admin
                </a>
              )}
            </div>
          )}

          <Link
            href="/dashboard/orders"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fa-solid fa-basket-shopping text-4xl text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any laundry services yet.</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {cart.map((item) => (
                <div key={item.serviceId} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-20 h-20 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <i className="fa-solid fa-shirt text-2xl text-primary-500" />
                    )}
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">₹{item.pricePerUnit} / {item.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.serviceId, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <i className="fa-solid fa-minus text-xs" />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.serviceId, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50"
                    >
                      <i className="fa-solid fa-plus text-xs" />
                    </button>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="font-bold text-gray-900 text-lg">₹{item.pricePerUnit * item.quantity}</div>
                    <button
                      onClick={() => removeFromCart(item.serviceId)}
                      className="text-red-500 text-sm font-medium hover:text-red-600 mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
                
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Pickup & Delivery</span>
                    {subtotalAfterDiscount >= 4999 ? (
                      <span className="text-green-500">Free</span>
                    ) : (
                      <span>₹100</span>
                    )}
                  </div>
                  
                  {/* Applied Offer display */}
                  {appliedOffer && (
                    <div className="flex justify-between text-green-600 font-medium bg-green-50 p-2 rounded-lg -mx-2 px-2">
                      <div className="flex items-center gap-1">
                        <i className="fa-solid fa-tag text-xs"></i>
                        <span>{appliedOffer.code} applied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                        <button onClick={removeOffer} className="text-red-500 hover:text-red-700 ml-1" title="Remove offer">
                          <i className="fa-solid fa-times"></i>
                        </button>
                      </div>
                    </div>
                  )}

                  {walletBalance > 0 && (
                    <div className="flex justify-between items-center py-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={useWallet} 
                          onChange={(e) => setUseWallet(e.target.checked)} 
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Use Wallet Balance (₹{walletBalance.toLocaleString('en-IN')})</span>
                      </label>
                      {useWallet && (
                        <span className="text-green-500 text-sm font-bold">
                          -₹{finalWalletDeduction.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between text-xl font-black text-gray-900 mb-6">
                  <span>Estimated Total</span>
                  <span>₹{estimatedTotal.toLocaleString('en-IN')}</span>
                </div>

                {/* Apply Promo Code UI */}
                {!appliedOffer && (
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-900 mb-2">Offers & Promotions</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={offerInput}
                        onChange={(e) => setOfferInput(e.target.value.toUpperCase())}
                        placeholder="Enter Promo Code" 
                        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none uppercase"
                      />
                      <button 
                        type="button"
                        onClick={handleApplyOffer}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {offerError && <p className="text-red-500 text-xs mt-1 font-medium">{offerError}</p>}
                  </div>
                )}
                
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg mb-6 font-medium border border-blue-100">
                  <i className="fa-solid fa-info-circle mr-1"></i>
                  Any active package discounts (up to 20%) will be applied automatically on your final invoice.
                </p>

                <form onSubmit={handleCheckout} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Pickup/Delivery Address *</label>
                    
                    {addresses.length > 0 && (
                      <div className="space-y-3 mb-4">
                        {addresses.map((addr, idx) => (
                          <label key={idx} className={`block border rounded-xl p-4 cursor-pointer transition-colors ${selectedAddressIdx === idx && !showNewAddress ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-primary-200'}`}>
                            <div className="flex items-start gap-3">
                              <input type="radio" name="addressSelect" checked={selectedAddressIdx === idx && !showNewAddress} onChange={() => { setSelectedAddressIdx(idx); setShowNewAddress(false); }} className="mt-1" />
                              <div>
                                <p className="font-medium text-gray-900">{addr.building}, {addr.street}</p>
                                <p className="text-sm text-gray-500">{addr.area} - {addr.pincode}</p>
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                    
                    <button type="button" onClick={() => setShowNewAddress(true)} className={`text-sm font-medium ${showNewAddress ? 'text-primary-600' : 'text-gray-500 hover:text-primary-600'} flex items-center gap-2 mb-4`}>
                      <i className="fa-solid fa-plus" /> Add New Address
                    </button>

                    {showNewAddress && (
                      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="col-span-2">
                          <input required type="text" placeholder="Building / Floor / Flat No." value={newAddress.building} onChange={e => setNewAddress({...newAddress, building: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input required type="text" placeholder="Street / Road Name" value={newAddress.street} onChange={e => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div className="col-span-1">
                          <input required type="text" placeholder="Area / Locality" value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div className="col-span-1">
                          <input required type="text" placeholder="Pin Code" value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                        </div>
                        <div className="col-span-2">
                          <input type="text" placeholder="Google Maps Link (Live Capture Optional)" value={newAddress.mapLink} onChange={e => setNewAddress({...newAddress, mapLink: e.target.value})} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm" />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Instructions</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder="E.g., Please ring the bell, leave with guard..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === 'CASH' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                        <input type="radio" name="paymentMethod" value="CASH" checked={paymentMethod === 'CASH'} onChange={() => setPaymentMethod('CASH')} className="sr-only" />
                        <i className="fa-solid fa-money-bill text-xl mb-1 text-gray-600"></i>
                        <span className="text-sm font-medium">Cash on Delivery</span>
                      </label>
                      <label className={`border rounded-lg p-3 flex flex-col items-center cursor-pointer transition-all ${paymentMethod === 'QR' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-200'}`}>
                        <input type="radio" name="paymentMethod" value="QR" checked={paymentMethod === 'QR'} onChange={() => setPaymentMethod('QR')} className="sr-only" />
                        <i className="fa-solid fa-qrcode text-xl mb-1 text-gray-600"></i>
                        <span className="text-sm font-medium">Pay via QR (UPI)</span>
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'QR' && (
                    <div className="bg-gray-50 p-4 rounded-xl flex flex-col items-center justify-center border border-gray-200">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Scan QR to pay ₹{estimatedTotal.toLocaleString('en-IN')}</p>
                      <Image src="/images/upi_qr.png" alt="UPI QR Code" width={128} height={128} className="w-32 h-32 object-contain rounded-lg shadow-sm mb-2 bg-white p-2 border border-gray-200" />
                      <p className="text-[10px] text-gray-400">Payment will be verified upon delivery.</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-4 shadow-md shadow-primary-500/20 disabled:opacity-70"
                  >
                    {loading ? (
                      <i className="fa-solid fa-circle-notch fa-spin" />
                    ) : (
                      <>
                        Confirm Order <i className="fa-solid fa-arrow-right" />
                      </>
                    )}
                  </button>
                  <p className="text-xs text-center text-gray-400 mt-4">
                    By confirming, you agree to our terms of service and laundry policies.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
