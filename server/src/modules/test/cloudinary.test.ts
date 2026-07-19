import { cloudinary } from "../../integrations/cloudinary";

async function testCloudinary() {
  console.log("Cloud Name:", cloudinary.config().cloud_name);
}

testCloudinary();