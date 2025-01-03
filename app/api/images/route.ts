
import { NextRequest, NextResponse } from 'next/server'
import { apiUploadImage } from '@/app/services/imageUpload'

export async function POST(request: NextRequest) {
  // Step 1: Check if user is authenticated (With NextAuth)

  // Step 2: Get image from request (With Next.js API Routes)
  const formData = await request.formData()
  const imageFile = formData.get('image') as unknown as File | null
  if (!imageFile) {
    return NextResponse.json(null, { status: 400 })
  }
  const imageBuffer = Buffer.from(await imageFile.arrayBuffer())

  // Step 3: Resize image (With Sharp)
  
  // Step 4: Upload image (With AWS SDK)
  const imageUrl = await apiUploadImage(imageBuffer, imageFile.name)

  // Step 5: Update user in database (With Drizzle ORM)

  // Step 6: Return new image URL
  return NextResponse.json({ imageUrl })
}

// Export types for API Routes
export type UploadProfileImageResponse = ExtractGenericFromNextResponse<
  Awaited<ReturnType<typeof POST>>
>
type ExtractGenericFromNextResponse<Type> = Type extends NextResponse<infer X>
  ? X
  : never