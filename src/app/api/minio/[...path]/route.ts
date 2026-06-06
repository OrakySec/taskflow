import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const minioHost = process.env.MINIO_ENDPOINT || 'localhost';
    const minioPort = process.env.MINIO_PORT || '9000';
    const useSSL = process.env.MINIO_USE_SSL === 'true';
    const protocol = useSSL ? 'https' : 'http';
    
    // Extract query parameters correctly
    const searchParams = request.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    
    // Extract the bucket and object path
    // The params.path comes from the URL /api/minio/bucket-name/object-name.jpg
    const resolvedParams = await params;
    const pathString = resolvedParams.path.join('/');
    const url = `${protocol}://${minioHost}:${minioPort}/${pathString}${query}`;

    console.log(`[Minio Proxy] Fetching ${url}`);

    // Fetch from internal Minio
    const response = await fetch(url, {
      // Avoid caching at proxy level for presigned URLs
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error(`[Minio Proxy] Failed with status ${response.status} for URL ${url}`);
      return new NextResponse("File not found or access denied", { status: response.status });
    }

    // Return the response as a stream with the same headers
    const headers = new Headers();
    response.headers.forEach((value, key) => {
      headers.set(key, value);
    });

    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("[Minio Proxy] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
