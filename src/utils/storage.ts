import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import sharp from "sharp";

const endpoint = process.env["AWS_ENDPOINT"] || "";
const region = process.env["AWS_DEFAULT_REGION"] || "us-east-1";
const bucket = process.env["AWS_BUCKET"] || "";

const client = new S3Client({
  endpoint,
  region,
  credentials: {
    accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
    secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
  },
  forcePathStyle: true,
});

export async function getPhotoUrl(storedPath: string | null | undefined): Promise<string | null> {
  if (!storedPath) return null;
  if (storedPath.startsWith("http://") || storedPath.startsWith("https://")) {
    return storedPath;
  }

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: storedPath });
    return await getSignedUrl(client, command, { expiresIn: 604800 });
  } catch {
    const base = `${endpoint.replace(/\/+$/, "")}/${bucket}/`;
    return `${base}${storedPath}`;
  }
}

export async function uploadPhoto(
  base64Data: string | null | undefined,
  key: string,
): Promise<string | null> {
  if (!base64Data) return null;

  const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;

  const buffer = Buffer.from(matches[2]!, "base64");

  const resized = await sharp(buffer)
    .resize(400, 400, { fit: "cover", position: "center" })
    .toFormat("webp")
    .toBuffer();

  const objectKey = `uploads/workers/${key}.webp`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: resized,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000",
    }),
  );

  return objectKey;
}

export async function deletePhoto(storedValue: string | null | undefined): Promise<void> {
  if (!storedValue) return;

  let key: string;
  if (storedValue.startsWith("http://") || storedValue.startsWith("https://")) {
    const base = `${endpoint.replace(/\/+$/, "")}/${bucket}/`;
    if (!storedValue.startsWith(base)) return;
    key = storedValue.slice(base.length);
  } else {
    key = storedValue;
  }

  if (!key) return;
  try {
    await client.send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key }),
    );
  } catch {
    // ignore if already gone
  }
}
