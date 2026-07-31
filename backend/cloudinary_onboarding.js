const cloudinary = require('cloudinary').v2;

// 1. Configure Cloudinary
// Set these environment variables before running:
//   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUD_NAME', 
  api_key: process.env.CLOUDINARY_API_KEY || 'YOUR_API_KEY', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YOUR_API_SECRET' 
});

async function main() {
  try {
    console.log("Uploading image...");
    
    // 2. Upload an image
    const uploadResult = await cloudinary.uploader.upload(
      'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg',
      { public_id: 'onboarding_shoes' }
    );
    
    console.log("\n--- Upload Successful ---");
    console.log("Public ID:", uploadResult.public_id);
    console.log("Secure URL:", uploadResult.secure_url);

    // 3. Get image details
    console.log("\n--- Image Metadata ---");
    console.log("Width:", uploadResult.width);
    console.log("Height:", uploadResult.height);
    console.log("Format:", uploadResult.format);
    console.log("Size (bytes):", uploadResult.bytes);

    // 4. Transform the image
    // Generate a transformed version of the image URL using both f_auto (automatic format selection) and q_auto (automatic quality).
    const transformUrl = cloudinary.url(uploadResult.public_id, {
      // f_auto: Automatically selects the most efficient image format based on the browser (e.g., WebP, AVIF)
      fetch_format: 'auto',
      // q_auto: Automatically optimizes image quality to reduce file size without visible degradation
      quality: 'auto'
    });

    console.log("\n--- Transformation ---");
    console.log("Done! Click link below to see optimized version of the image. Check the size and the format.");
    console.log(transformUrl);

  } catch (error) {
    console.error("Error during Cloudinary onboarding:", error);
  }
}

main();
