import { NextRequest, NextResponse } from "next/server";
import { minioClient } from "@/lib/minio";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    
    // path is [bucket, ...objectPath]
    if (!resolvedParams.path || resolvedParams.path.length < 2) {
      return new NextResponse("Invalid path", { status: 400 });
    }
    
    const bucketName = resolvedParams.path[0];
    const objectName = resolvedParams.path.slice(1).join('/');

    // Get object stat to retrieve Content-Type and size
    const stat = await minioClient.statObject(bucketName, objectName);
    
    // Get the object stream from Minio
    const dataStream = await minioClient.getObject(bucketName, objectName);
    
    const headers = new Headers();
    if (stat.metaData && stat.metaData['content-type']) {
      headers.set('Content-Type', stat.metaData['content-type']);
    }
    headers.set('Content-Length', stat.size.toString());
    
    // Create a Web ReadableStream from the Node.js stream
    const stream = new ReadableStream({
      start(controller) {
        dataStream.on('data', (chunk) => controller.enqueue(chunk));
        dataStream.on('end', () => controller.close());
        dataStream.on('error', (err) => controller.error(err));
      }
    });

    return new NextResponse(stream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error("[Minio Proxy] Error:", error);
    if (error.code === 'NotFound' || error.code === 'NoSuchKey') {
      return new NextResponse("File not found", { status: 404 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
