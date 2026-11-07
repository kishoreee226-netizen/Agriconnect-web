// booking/booking-loader.js
(async function initAgriBookingModule() {
  try {
    const timestamp = Date.now();

    // 1. Load Booking CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `booking/booking.css?v=${timestamp}`;
    document.head.appendChild(link);

    // 2. Fetch and Inject booking.html into DOM
    const response = await fetch(`booking/booking.html?v=${timestamp}`);
    if (response.ok) {
      const htmlText = await response.text();
      const wrapper = document.createElement('div');
      wrapper.id = 'agri-booking-module-mount';
      wrapper.innerHTML = htmlText;
      document.body.appendChild(wrapper);
    }

    // 3. Load Booking JS Engine
    const script = document.createElement('script');
    script.src = `booking/booking.js?v=${timestamp}`;
    document.body.appendChild(script);

    console.log("✅ AgriConnect Booking Module Loaded Successfully");
  } catch (err) {
    console.error("❌ Failed to load AgriConnect Booking Module:", err);
  }
})();
