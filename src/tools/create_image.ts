import { SolanaAgentKit } from "../index";
import axios from "axios";
import * as fs from "fs";
import * as dotenv from "dotenv";

/**
 * Generate an image using custom image generation API
 * @param agent SolanaAgentKit instance
 * @param prompt Text description of the image to generate
 * @param width Image width (default: 720)
 * @param height Image height (default: 1024)
 * @param numSteps Number of generation steps (default: 24)
 * @param guidance Guidance scale (default: 3.5)
 * @param seed Random seed (default: 1)
 * @param strength Generation strength (default: 1)
 * @returns Object containing the generated image buffer and saved image path
 */
export async function create_image(
  agent: SolanaAgentKit,
  prompt: string,
  width: number = 720,
  height: number = 1024,
  numSteps: number = 24,
  guidance: number = 3.5,
  seed: number = 1,
  strength: number = 1
) {
  const API_URL = process.env.ZKAGI_IMAGE_URL;

  if (!API_URL) {
    throw new Error("ZKAGI_IMAGE_URL environment variable is not set");
  }

  try {
    const payload = {
      prompt,
      width,
      height,
      num_steps: numSteps,
      guidance,
      seed,
      strength
    };

    console.log("Sending request to generate image with payload:", payload);
    
    const response = await axios.post(API_URL, payload, {
      headers: {
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    const buffer = Buffer.from(response.data, "binary");
    
    // Save the generated image to a file in the current directory
    const imagePath = `image_${Date.now()}.jpg`;
    fs.writeFileSync(imagePath, buffer);
    console.log(`Image saved to ${imagePath}`);

    return {
      images: imagePath // For compatibility with original function's return format
    };
  } catch (error: any) {
    console.error('Error generating image:', error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}