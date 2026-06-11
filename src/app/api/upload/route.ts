import { NextResponse } from 'next/server';
import { minioClient, BUCKET_NAME, ensureBucketExists } from '@/lib/minio';
import { v4 as uuidv4 } from 'uuid';

// Aumenta o limite de tamanho do body para 100 MB
export const config = {
  api: { bodyParser: { sizeLimit: '20mb' } },
};

export const maxDuration = 60; // segundos (para uploads grandes)

export async function POST(request: Request) {
  try {
    // Garantir que o bucket exista
    await ensureBucketExists();

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 });
    }

    const uploadedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const fileExtension = file.name.split('.').pop();
      const objectName = `${uuidv4()}.${fileExtension}`;
      
      await minioClient.putObject(
        BUCKET_NAME,
        objectName,
        buffer,
        file.size,
        { 'Content-Type': file.type }
      );

      // Store the Next.js proxy path directly
      let fileUrl = `/api/minio/${BUCKET_NAME}/${objectName}`;

      uploadedFiles.push({
        filename: file.name,
        fileUrl: fileUrl,
        fileSize: file.size,
        mimeType: file.type
      });
    }

    return NextResponse.json({ files: uploadedFiles }, { status: 200 });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: 'Falha ao processar o upload: ' + (error.message || 'Erro desconhecido') }, { status: 500 });
  }
}
