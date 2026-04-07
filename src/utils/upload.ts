import axios from 'axios';

export async function uploadImagem(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  // O nome do preset que você acabou de criar
  formData.append('upload_preset', 'eurotrip'); 

  try {
    // Usando o seu Cloud Name: dozjijswp
    const res = await axios.post(
      'https://api.cloudinary.com/v1_1/dozjijswp/image/upload', 
      formData
    );
    
    // Isso retorna o link seguro (https) da foto
    return res.data.secure_url; 
  } catch (error: any) {
    // Se der erro, o console vai nos dizer exatamente o porquê
    console.error("Erro no Cloudinary:", error.response?.data || error.message);
    throw new Error("Falha ao subir imagem para o Cloudinary");
  }
}