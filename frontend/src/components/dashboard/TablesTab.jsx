import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  CheckCircle, 
  XCircle,
  UtensilsCrossed,
  Clock,
  AlertCircle
} from 'lucide-react';

const TablesTab = ({ restaurant }) => {
  const [tables, setTables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [newTable, setNewTable] = useState({
    number: '',
    isOccupied: false
  });

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables/restaurant/${restaurant.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setTables(data.data || []);
      } else {
        console.error('Erro ao buscar mesas');
      }
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTable = async () => {
    if (!newTable.number) {
      alert('Por favor, informe o número da mesa');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(newTable.number),
          restaurantId: restaurant.id,
          isOccupied: newTable.isOccupied
        }),
      });

      if (response.ok) {
        await fetchTables();
        setNewTable({ number: '', isOccupied: false });
        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao criar mesa');
      }
    } catch (error) {
      console.error('Erro ao criar mesa:', error);
      alert('Erro ao criar mesa');
    }
  };

  const handleUpdateTable = async () => {
    if (!editingTable || !editingTable.number) {
      alert('Por favor, informe o número da mesa');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables/${editingTable.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: parseInt(editingTable.number),
          isOccupied: editingTable.isOccupied
        }),
      });

      if (response.ok) {
        await fetchTables();
        setEditingTable(null);
        setIsDialogOpen(false);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao atualizar mesa');
      }
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      alert('Erro ao atualizar mesa');
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!confirm('Tem certeza que deseja excluir esta mesa?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables/${tableId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTables();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao excluir mesa');
      }
    } catch (error) {
      console.error('Erro ao excluir mesa:', error);
      alert('Erro ao excluir mesa');
    }
  };

  const toggleTableOccupancy = async (table) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/tables/${table.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          number: table.number,
          isOccupied: !table.isOccupied
        }),
      });

      if (response.ok) {
        await fetchTables();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Erro ao atualizar status da mesa');
      }
    } catch (error) {
      console.error('Erro ao atualizar status da mesa:', error);
      alert('Erro ao atualizar status da mesa');
    }
  };

  const openCreateDialog = () => {
    setEditingTable(null);
    setNewTable({ number: '', isOccupied: false });
    setIsDialogOpen(true);
  };

  const openEditDialog = (table) => {
    setEditingTable({ ...table });
    setIsDialogOpen(true);
  };

  const getTableStatusBadge = (isOccupied) => {
    return isOccupied ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="h-3 w-3" />
        Ocupada
      </Badge>
    ) : (
      <Badge variant="default" className="flex items-center gap-1 bg-green-500">
        <CheckCircle className="h-3 w-3" />
        Livre
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gerenciar Mesas</h2>
          <p className="text-muted-foreground">
            Gerencie as mesas do seu restaurante e controle a ocupação
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTable ? 'Editar Mesa' : 'Nova Mesa'}
              </DialogTitle>
              <DialogDescription>
                {editingTable 
                  ? 'Edite as informações da mesa' 
                  : 'Adicione uma nova mesa ao seu restaurante'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Número da Mesa *</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={editingTable ? editingTable.number : newTable.number}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingTable) {
                      setEditingTable(prev => ({ ...prev, number: value }));
                    } else {
                      setNewTable(prev => ({ ...prev, number: value }));
                    }
                  }}
                  placeholder="Ex: 1, 2, 3..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isOccupied"
                  checked={editingTable ? editingTable.isOccupied : newTable.isOccupied}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    if (editingTable) {
                      setEditingTable(prev => ({ ...prev, isOccupied: checked }));
                    } else {
                      setNewTable(prev => ({ ...prev, isOccupied: checked }));
                    }
                  }}
                  className="rounded"
                />
                <Label htmlFor="isOccupied">Mesa ocupada</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={editingTable ? handleUpdateTable : handleCreateTable}>
                  {editingTable ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Mesas</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Livres</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {tables.filter(table => !table.isOccupied).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Ocupadas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {tables.filter(table => table.isOccupied).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      {tables.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className={`hover:shadow-md transition-shadow ${table.isOccupied ? 'border-red-200' : 'border-green-200'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <UtensilsCrossed className="h-5 w-5" />
                    <span className="font-bold text-lg">Mesa {table.number}</span>
                  </div>
                  {getTableStatusBadge(table.isOccupied)}
                </div>
                
                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    variant={table.isOccupied ? "outline" : "default"}
                    onClick={() => toggleTableOccupancy(table)}
                    className="flex-1 mr-2"
                  >
                    {table.isOccupied ? 'Liberar' : 'Ocupar'}
                  </Button>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(table)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteTable(table.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Nenhuma mesa cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando mesas ao seu restaurante
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeira Mesa
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TablesTab;

