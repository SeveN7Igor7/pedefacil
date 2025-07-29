import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const uploadService = {
  async uploadProductImage(file, restaurantId) {
    try {
      // Criar diretório de uploads se não existir
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const restaurantDir = path.join(uploadsDir, `restaurant_${restaurantId}`);
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      if (!fs.existsSync(restaurantDir)) {
        fs.mkdirSync(restaurantDir, { recursive: true });
      }

      // Gerar nome único para o arquivo
      const fileExtension = path.extname(file.originalname);
      const uniqueId = uuidv4();
      const fileName = `product_${uniqueId}${fileExtension}`;
      const filePath = path.join(restaurantDir, fileName);

      // Salvar arquivo
      fs.writeFileSync(filePath, file.buffer);

      // Retornar URL relativa para acesso
      return `/uploads/restaurant_${restaurantId}/${fileName}`;
    } catch (error) {
      throw new Error(`Erro ao fazer upload da imagem: ${error.message}`);
    }
  },

  async deleteProductImage(imageUrl) {
    try {
      if (!imageUrl) return;

      const filePath = path.join(process.cwd(), imageUrl);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem:', error.message);
    }
  }
};

