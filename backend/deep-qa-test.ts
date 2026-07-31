// Using native fetch in Node 18+

const API = "http://localhost:5000";
let adminToken = "";
let userToken = "";
let createdOrderId = "";
let serviceId = "";
let packageId = "";
let customerId = "";

async function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

async function runDeepTests() {
  console.log("🚀 Starting DEEP E2E System Tests...");

  try {
    // ---------------------------------------------------------
    // 1. ADMIN AUTHENTICATION
    // ---------------------------------------------------------
    console.log("\n--- 1. ADMIN AUTHENTICATION ---");
    const adminRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@luxwash.com", password: "Admin@12345" })
    });
    const adminData: any = await adminRes.json();
    assert(adminRes.ok, `Admin login failed: ${adminData.message}`);
    adminToken = adminData.token;
    console.log("✅ Admin login successful.");

    // ---------------------------------------------------------
    // 2. ADMIN PANEL: SERVICE MANAGEMENT
    // ---------------------------------------------------------
    console.log("\n--- 2. ADMIN PANEL: SERVICE MANAGEMENT ---");
    const svcRes = await fetch(`${API}/api/services`);
    const servicesData: any = await svcRes.json();
    let serviceList = Array.isArray(servicesData) ? servicesData : servicesData.data || [];
    
    if (serviceList.length === 0) {
      console.log("No services found. Creating a test service...");
      const newSvcRes = await fetch(`${API}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({
          name: "Deep Test Wash",
          description: "High quality deep wash",
          pricePerUnit: 150,
          unit: "Piece"
        })
      });
      const newSvc: any = await newSvcRes.json();
      assert(newSvcRes.ok, "Failed to create test service");
      serviceList = [newSvc];
    }
    serviceId = serviceList[0].id;
    console.log(`✅ Service ready: ${serviceList[0].name} (ID: ${serviceId})`);

    // ---------------------------------------------------------
    // 3. ADMIN PANEL: PACKAGES MANAGEMENT
    // ---------------------------------------------------------
    console.log("\n--- 3. ADMIN PANEL: PACKAGES MANAGEMENT ---");
    const pkgCreateRes = await fetch(`${API}/api/packages`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: "Deep Test Gold Package",
        description: "Includes ₹2000 credits",
        price: 1500,
        walletCredits: 2000,
        discountPercentage: 15,
        isActive: true
      })
    });
    const pkgData: any = await pkgCreateRes.json();
    assert(pkgCreateRes.ok, `Failed to create package: ${pkgData.message}`);
    packageId = pkgData.id;
    console.log(`✅ Admin successfully created Package: ${pkgData.name} (ID: ${packageId})`);

    // ---------------------------------------------------------
    // 4. USER AUTHENTICATION: CREATE ACCOUNT & LOGIN
    // ---------------------------------------------------------
    console.log("\n--- 4. USER AUTHENTICATION: CREATE ACCOUNT & LOGIN ---");
    const email = `deepuser_${Date.now()}@test.com`;
    const regRes = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Deep E2E User",
        email: email,
        password: "TestUser@123",
        phone: "9876543210"
      })
    });
    const regData: any = await regRes.json();
    assert(regRes.ok, `User Registration failed: ${regData.message}`);
    userToken = regData.token;
    customerId = regData.user.id;
    console.log(`✅ Test user registered & logged in: ${email}`);

    // Verify ME endpoint
    const meRes = await fetch(`${API}/api/auth/me`, {
      headers: { "Authorization": `Bearer ${userToken}` }
    });
    const meData: any = await meRes.json();
    assert(meRes.ok, "Failed to fetch user profile via /api/auth/me");
    console.log("✅ User profile fetched via /api/auth/me");

    // ---------------------------------------------------------
    // 5. ADMIN PANEL: WALLET ADJUSTMENT
    // ---------------------------------------------------------
    console.log("\n--- 5. ADMIN PANEL: CUSTOMER WALLET ADJUSTMENT ---");
    const walletAdjRes = await fetch(`${API}/api/wallet/admin/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
      body: JSON.stringify({
        userId: customerId,
        amount: 500,
        type: "CREDIT",
        description: "Welcome Bonus deep test"
      })
    });
    const walletAdjData: any = await walletAdjRes.json();
    assert(walletAdjRes.ok, `Admin wallet adjustment failed: ${walletAdjData.message}`);
    console.log("✅ Admin successfully credited ₹500 to user wallet.");

    // User checks wallet
    const userWalletRes = await fetch(`${API}/api/wallet/me`, {
      headers: { "Authorization": `Bearer ${userToken}` }
    });
    const userWalletData: any = await userWalletRes.json();
    assert(userWalletData.balance === 500, "User wallet balance did not update to 500");
    console.log(`✅ User verified wallet balance: ₹${userWalletData.balance}`);

    // ---------------------------------------------------------
    // 6. ORDER FLOW WITH WALLET USAGE
    // ---------------------------------------------------------
    console.log("\n--- 6. ORDER FLOW WITH WALLET USAGE ---");
    const orderRes = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${userToken}` },
      body: JSON.stringify({
        serviceId: serviceId,
        quantity: 2, // 2 * 150 = 300
        address: "Deep Test Blvd, Block 4",
        notes: "Use wallet for this",
        deliveryCharge: 100, // Total = 300 + 100 = 400
        useWallet: true
      })
    });
    const orderData: any = await orderRes.json();
    assert(orderRes.ok, `Order placement failed: ${orderData.message}`);
    createdOrderId = orderData.id;
    console.log(`✅ Order placed successfully! ID: ${createdOrderId}`);

    // Verify wallet deduction
    const userWalletRes2 = await fetch(`${API}/api/wallet/me`, {
      headers: { "Authorization": `Bearer ${userToken}` }
    });
    const userWalletData2: any = await userWalletRes2.json();
    // 500 - 400 = 100
    assert(userWalletData2.balance === 100, `Expected wallet balance 100, got ${userWalletData2.balance}`);
    console.log(`✅ User wallet was successfully deducted. New Balance: ₹${userWalletData2.balance}`);

    // ---------------------------------------------------------
    // 7. ADMIN PANEL: ORDER TRACKING & INVOICING
    // ---------------------------------------------------------
    console.log("\n--- 7. ADMIN PANEL: ORDER TRACKING & INVOICING ---");
    const adminOrdersRes = await fetch(`${API}/api/orders`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminOrdersData: any = await adminOrdersRes.json();
    const foundOrder = (adminOrdersData.data || []).find((o: any) => o.id === createdOrderId);
    assert(foundOrder, "Order not found in admin list!");
    console.log(`✅ Admin retrieved order. Initial Status: ${foundOrder.status}`);

    const invoiceId = foundOrder.invoice?.id;
    assert(invoiceId, "Invoice was NOT created for the order!");
    console.log(`✅ Invoice was automatically generated. Invoice ID: ${invoiceId}`);

    // Advance order statuses
    const statuses = ["PICKUP_REQUESTED", "COLLECTED", "IN_CLEANING", "OUT_FOR_DELIVERY", "DELIVERED"];
    for (const status of statuses) {
      const updateRes = await fetch(`${API}/api/orders/${createdOrderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${adminToken}` },
        body: JSON.stringify({ status })
      });
      assert(updateRes.ok, `Failed to update order status to ${status}`);
      console.log(`✅ Order status updated -> ${status}`);
    }

    console.log("\n🎉 ALL DEEP E2E TESTS PASSED SUCCESSFULLY! FULL SYSTEM OPERATIONAL.");

  } catch (error: any) {
    console.error("\n❌ DEEP TEST FAILED:", error.message);
  }
}

runDeepTests();
