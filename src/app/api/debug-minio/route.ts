import { NextResponse } from 'next/server';
import { minioClient, BUCKET_NAME } from '@/lib/minio';

export async function GET() {
  try {
    const endPoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || '9000';
    const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
    // Ocultar a senha para segurança
    const secretKeyLength = (process.env.MINIO_SECRET_KEY || 'minioadmin').length;
    
    let bucketExistsResult = null;
    let minioError = null;

    try {
      bucketExistsResult = await minioClient.bucketExists(BUCKET_NAME);
    } catch (e: any) {
      minioError = {
        message: e.message,
        code: e.code,
      };
    }

    return NextResponse.json({
      config: {
        endPoint,
        port,
        bucketName: BUCKET_NAME,
        accessKey,
        secretKeyConfigured: secretKeyLength > 0,
        secretKeyLength,
      },
      connectionTest: {
        success: minioError === null,
        bucketExists: bucketExistsResult,
        error: minioError,
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
