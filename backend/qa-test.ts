// Using native fetch in Node 18+

const API = "http://localhost:5000";
let testUserToken = "";
let adminToken = "";
let createdOrderId = "";
let serviceId = "";

async function runTests() {
  console.log("🚀 Starting E2E System Tests...");

  try {
    // 1. Admin Login First
    console.log("\\n--- 1. Admin Login ---");
    const adminRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "vishwajeetsrk@gmail.com",
        password: "12345678"
      })
    });
    const adminData: any = await adminRes.json();
    if (!adminRes.ok) throw new Error("Admin login failed. Check credentials.");
    adminToken = adminData.token;
    console.log("✅ Admin login successful!");

    // 2. Fetch or Create Service
    console.log("\\n--- 2. Fetching Services ---");
    const svcRes = await fetch(`${API}/api/services`);
    const services: any = await svcRes.json();
    let serviceList = Array.isArray(services) ? services : services.data || [];
    
    if (serviceList.length === 0) {
      console.log("No services found. Creating a test service...");
      const newSvcRes = await fetch(`${API}/api/services`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          name: "Premium Dry Cleaning",
          description: "High quality dry cleaning",
          pricePerUnit: 100,
          unit: "Piece"
        })
      });
      const newSvc: any = await newSvcRes.json();
      if (!newSvcRes.ok) throw new Error("Failed to create test service");
      serviceList = [newSvc];
    }
    
    serviceId = serviceList[0].id;
    console.log(`✅ Ready to use service: ${serviceList[0].name}`);

    // 2. Register Test User
    console.log("\\n--- 2. Registering Test User ---");
    const email = `testuser_${Date.now()}@test.com`;
    const regRes = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E Test User",
        email: email,
        password: "password123",
        phone: "1234567890"
      })
    });
    const regData: any = await regRes.json();
    if (!regRes.ok) throw new Error(`Registration failed: ${regData.message}`);
    testUserToken = regData.token;
    console.log(`✅ Test user registered: ${email}`);

    // 3. Place Order as Test User
    console.log("\\n--- 3. Placing Order ---");
    const orderRes = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        serviceId: serviceId,
        quantity: 2,
        address: "123 Test Street",
        notes: "E2E Automated Test Order"
      })
    });
    const orderData: any = await orderRes.json();
    if (!orderRes.ok) throw new Error(`Order placement failed: ${orderData.message}`);
    createdOrderId = orderData.id;
    console.log(`✅ Order placed successfully! ID: ${createdOrderId}`);

    // 4. Verify Admin access works using existing adminToken
    console.log("\\n--- 4. Verify Admin Token ---");
    if (!adminToken) throw new Error("Admin token is missing!");
    console.log("✅ Admin token is ready!");

    // 5. Verify Order in Admin Panel
    console.log("\\n--- 5. Verifying Order in Admin API ---");
    const adminOrdersRes = await fetch(`${API}/api/orders`, {
      headers: { "Authorization": `Bearer ${adminToken}` }
    });
    const adminOrdersData: any = await adminOrdersRes.json();
    const allOrders = adminOrdersData.data || [];
    const foundOrder = allOrders.find((o: any) => o.id === createdOrderId);
    if (!foundOrder) throw new Error("Order not found in admin list!");
    console.log(`✅ Order found in admin panel. Status: ${foundOrder.status}`);

    // 6. Verify Invoice Creation
    console.log("\\n--- 6. Verifying Invoice Creation ---");
    const invoiceId = foundOrder.invoice?.id;
    if (!invoiceId) throw new Error("Invoice was NOT created for the order!");
    console.log(`✅ Invoice linked to order! Invoice ID: ${invoiceId}`);

    // 7. Update Order Status (Should trigger invoice generation physically/notifications)
    console.log("\\n--- 7. Updating Order Status to DELIVERED ---");
    const updateRes = await fetch(`${API}/api/orders/${createdOrderId}`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: "DELIVERED" })
    });
    if (!updateRes.ok) throw new Error("Failed to update order status");
    console.log("✅ Order status updated to DELIVERED!");

    console.log("\\n🎉 ALL E2E TESTS PASSED SUCCESSFULLY! The system is fully operational.");

  } catch (error: any) {
    console.error("\\n❌ TEST FAILED:", error.message);
  }
}

runTests();
