import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Settings, 
  Save, 
  User, 
  Phone, 
  MapPin, 
  Building,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsTab = ({ restaurant }) => {
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    ownerName: '',
    phone: '',
    modeloWhatsapp: '',
    urlName: '',
    addressCep: '',
    addressStreet: '',
    addressNumber: '',
    addressComplement: '',
    addressNeighborhood: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        cnpj: restaurant.cnpj || '',
        ownerName: restaurant.ownerName || '',
        phone: restaurant.phone || '',
        modeloWhatsapp: restaurant.modeloWhatsapp || '',
        urlName: restaurant.urlName || '',
        addressCep: restaurant.addressCep || '',
        addressStreet: restaurant.addressStreet || '',
        addressNumber: restaurant.addressNumber || '',
        addressComplement: restaurant.addressComplement || '',
        addressNeighborhood: restaurant.addressNeighborhood || ''
      });
    }
  }, [restaurant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpar mensagem quando usuário começar a digitar
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/restaurants/${restaurant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Informações atualizadas com sucesso!' });
        // Atualizar dados no localStorage
        localStorage.setItem('restaurant', JSON.stringify(data.restaurant));
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar informações.' });
      }
    } catch (error) {
      console.error('Erro ao atualizar restaurante:', error);
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/restaurants/${restaurant.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
        setNewPassword('');
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Erro ao alterar senha.' });
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      setMessage({ type: 'error', text: 'Erro de conexão. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCNPJ = (value) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara XX.XXX.XXX/XXXX-XX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  };

  const formatPhone = (value) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const formatCEP = (value) => {
    // Remove tudo que não é dígito
    const digits = value.replace(/\D/g, '');
    
    // Aplica a máscara XXXXX-XXX
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)}-${digits.slice(5, 8)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Configurações do Restaurante</h2>
        <p className="text-muted-foreground">
          Gerencie as informações e configurações do seu restaurante
        </p>
      </div>

      {/* Messages */}
      {message.text && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Informações Básicas</span>
            </CardTitle>
            <CardDescription>
              Dados principais do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Restaurante</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nome do seu restaurante"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  name="cnpj"
                  value={formatCNPJ(formData.cnpj)}
                  onChange={(e) => handleInputChange({
                    target: { name: 'cnpj', value: e.target.value.replace(/\D/g, '') }
                  })}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Nome do Proprietário</Label>
                <Input
                  id="ownerName"
                  name="ownerName"
                  value={formData.ownerName}
                  onChange={handleInputChange}
                  placeholder="Nome completo do proprietário"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="urlName">Nome da URL</Label>
                <Input
                  id="urlName"
                  name="urlName"
                  value={formData.urlName}
                  onChange={handleInputChange}
                  placeholder="meurestaurante"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Este será o identificador único do seu restaurante no sistema
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Informações
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5" />
              <span>Informações de Contato</span>
            </CardTitle>
            <CardDescription>
              Dados de contato e WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone Principal</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formatPhone(formData.phone)}
                  onChange={(e) => handleInputChange({
                    target: { name: 'phone', value: e.target.value.replace(/\D/g, '') }
                  })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Formato: DDD + número (ex: 85999887766)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modeloWhatsapp">WhatsApp (Modelo)</Label>
                <Input
                  id="modeloWhatsapp"
                  name="modeloWhatsapp"
                  value={formData.modeloWhatsapp}
                  onChange={handleInputChange}
                  placeholder="85999887766"
                />
                <p className="text-sm text-muted-foreground">
                  Número do WhatsApp sem código do país (DDD + 8 dígitos)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Endereço do Restaurante</span>
            </CardTitle>
            <CardDescription>
              Localização do seu estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressCep">CEP</Label>
                  <Input
                    id="addressCep"
                    name="addressCep"
                    value={formatCEP(formData.addressCep)}
                    onChange={(e) => handleInputChange({
                      target: { name: 'addressCep', value: e.target.value.replace(/\D/g, '') }
                    })}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressNeighborhood">Bairro</Label>
                  <Input
                    id="addressNeighborhood"
                    name="addressNeighborhood"
                    value={formData.addressNeighborhood}
                    onChange={handleInputChange}
                    placeholder="Nome do bairro"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="addressStreet">Rua/Avenida</Label>
                <Input
                  id="addressStreet"
                  name="addressStreet"
                  value={formData.addressStreet}
                  onChange={handleInputChange}
                  placeholder="Nome da rua ou avenida"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressNumber">Número</Label>
                  <Input
                    id="addressNumber"
                    name="addressNumber"
                    value={formData.addressNumber}
                    onChange={handleInputChange}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressComplement">Complemento</Label>
                  <Input
                    id="addressComplement"
                    name="addressComplement"
                    value={formData.addressComplement}
                    onChange={handleInputChange}
                    placeholder="Sala, andar, etc."
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Segurança</span>
            </CardTitle>
            <CardDescription>
              Alterar senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite a nova senha"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              </div>

              <Button 
                onClick={handlePasswordChange} 
                disabled={isLoading || !newPassword}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
          <CardDescription>
            Dados técnicos e de integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <Label className="text-muted-foreground">ID do Restaurante</Label>
              <p className="font-mono">{restaurant.id}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Data de Cadastro</Label>
              <p>{new Date(restaurant.createdAt).toLocaleDateString('pt-BR')}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Última Atualização</Label>
              <p>{new Date(restaurant.updatedAt).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;

