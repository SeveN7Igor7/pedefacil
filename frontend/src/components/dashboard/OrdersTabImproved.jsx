"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Package,
  Eye,
  CheckCircle,
  Truck,
  Search,
  RefreshCw,
  MapPin,
  Phone,
  User,
  BellRing,
  UtensilsCrossed,
} from "lucide-react"

const OrdersTabImproved = ({ restaurant, onRefresh }) => {
  const [orders, setOrders] = useState([])
  const [deliveryOrders, setDeliveryOrders] = useState([])
  const [tableOrders, setTableOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isAccepting, setIsAccepting] = useState(false)
  const [deliveryTime, setDeliveryTime] = useState("")
  const [newOrdersCount, setNewOrdersCount] = useState(0)
  const [lastOrderId, setLastOrderId] = useState(null)
  const [notificationSound, setNotificationSound] = useState(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    fetchOrders()

    // Configurar polling para notificações em tempo real
    intervalRef.current = setInterval(() => {
      fetchOrdersForNotification()
    }, 5000) // Verificar a cada 5 segundos

    // Criar som de notificação
    const audio = new Audio("/notifications.mp3")
    setNotificationSound(audio)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])



  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`)

      if (response.ok) {
        const data = await response.json()
        const allOrders = data.data || []
        setOrders(allOrders)

        // Separar pedidos por tipo
        const delivery = allOrders.filter((order) => order.orderType === "delivery")
        const table = allOrders.filter((order) => order.orderType === "table")

        setDeliveryOrders(delivery)
        setTableOrders(table)
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchOrdersForNotification = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/restaurant/${restaurant.id}`)

      if (response.ok) {
        const data = await response.json()
        const allOrders = data.data || []

        // Verificar se há novos pedidos
        if (allOrders.length > 0 && lastOrderId !== null) {
          const latestOrder = allOrders[0]
          if (latestOrder.id > lastOrderId) {
            // Novo pedido detectado
            setNewOrdersCount((prev) => prev + 1)

            // Tocar som de notificação
            if (notificationSound) {
              notificationSound.play().catch((e) => console.log("Erro ao tocar notificação:", e))
            }

            // Mostrar notificação do navegador
            if (Notification.permission === "granted") {
              new Notification("Novo Pedido Recebido!", {
                body: `Pedido #${latestOrder.id} de ${latestOrder.customer?.fullName}`,
                icon: "/favicon.ico",
              })
            }
          }
        }

        if (allOrders.length > 0) {
          setLastOrderId(allOrders[0].id)
        }

        // Atualizar dados
        setOrders(allOrders)
        const delivery = allOrders.filter((order) => order.orderType === "delivery")
        const table = allOrders.filter((order) => order.orderType === "table")
        setDeliveryOrders(delivery)
        setTableOrders(table)
      }
    } catch (error) {
      console.error("Erro ao verificar novos pedidos:", error)
    }
  }

  const acceptOrder = async (orderId) => {
    if (!deliveryTime) {
      alert("Por favor, informe o prazo de entrega")
      return
    }

    try {
      setIsAccepting(true)
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/${orderId}/accept`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          deliveryTime: deliveryTime,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        onRefresh()
        setSelectedOrder(null)
        setDeliveryTime("")
        alert("Pedido aceito com sucesso!")
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao aceitar pedido")
      }
    } catch (error) {
      console.error("Erro ao aceitar pedido:", error)
      alert("Erro de conexão")
    } finally {
      setIsAccepting(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_ENDPOINT}/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        await fetchOrders()
        onRefresh()
        alert("Status atualizado com sucesso!")
      } else {
        const data = await response.json()
        alert(data.error || "Erro ao atualizar status")
      }
    } catch (error) {
      console.error("Erro ao atualizar status:", error)
      alert("Erro de conexão")
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: "Pendente", variant: "secondary", color: "bg-yellow-100 text-yellow-800" },
      preparing: { label: "Preparando", variant: "default", color: "bg-blue-100 text-blue-800" },
      delivered: { label: "Entregue", variant: "default", color: "bg-green-100 text-green-800" },
      finished: { label: "Finalizado", variant: "default", color: "bg-gray-100 text-gray-800" },
      cleaned: { label: "Limpo", variant: "default", color: "bg-gray-100 text-gray-800" },
    }

    const config = statusConfig[status] || { label: status, variant: "secondary", color: "bg-gray-100 text-gray-800" }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getStatusActions = (order) => {
    const actions = []

    if (order.status === "pending") {
      actions.push(
        <Dialog key="accept">
          <DialogTrigger asChild>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              Aceitar
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aceitar Pedido #{order.id}</DialogTitle>
              <DialogDescription>Informe o prazo de entrega para o cliente</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryTime">Prazo de Entrega</Label>
                <Input
                  id="deliveryTime"
                  placeholder="Ex: 30-45 minutos"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={() => acceptOrder(order.id)} disabled={isAccepting} className="flex-1">
                  {isAccepting ? "Aceitando..." : "Aceitar Pedido"}
                </Button>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>,
      )
    }

    if (order.status === "preparing") {
      if (order.orderType === "delivery") {
        actions.push(
          <Button
            key="deliver"
            size="sm"
            onClick={() => updateOrderStatus(order.id, "delivered")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Truck className="h-4 w-4 mr-1" />
            Marcar como Entregue
          </Button>,
        )
      } else {
        actions.push(
          <Button
            key="ready"
            size="sm"
            onClick={() => updateOrderStatus(order.id, "delivered")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Pronto para Servir
          </Button>,
        )
      }
    }

    if (order.status === "delivered") {
      actions.push(
        <Button key="finish" size="sm" onClick={() => updateOrderStatus(order.id, "finished")} variant="outline">
          Finalizar
        </Button>,
      )
    }

    if (order.status === "finished" && order.orderType === "table") {
      actions.push(
        <Button key="clean" size="sm" onClick={() => updateOrderStatus(order.id, "cleaned")} variant="outline">
          Mesa Limpa
        </Button>,
      )
    }

    return actions
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const getPaymentMethodLabel = (method) => {
    const methods = {
      card: "Cartão",
      cash: "Dinheiro",
      pix: "PIX",
    }
    return methods[method] || method
  }

  const filterOrdersBySearch = (ordersList) => {
    if (!searchTerm) return ordersList

    return ordersList.filter(
      (order) =>
        order.id.toString().includes(searchTerm) ||
        order.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer?.phone?.includes(searchTerm) ||
        (order.table && order.table.number.toString().includes(searchTerm)),
    )
  }

  const filterOrdersByStatus = (ordersList) => {
    if (statusFilter === "all") return ordersList
    return ordersList.filter((order) => order.status === statusFilter)
  }

  const getFilteredOrders = (ordersList) => {
    let filtered = filterOrdersBySearch(ordersList)
    filtered = filterOrdersByStatus(filtered)

    // Ordenar por data de criação (mais recentes primeiro)
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  const requestNotificationPermission = () => {
    if (Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  // Solicitar permissão para notificações quando o componente carrega
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-muted-foreground">Carregando pedidos...</p>
          </div>
        </div>
      </div>
    )
  }

  const OrderCard = ({ order }) => (
    <Card key={order.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="font-semibold text-lg">
                  Pedido #{order.id}
                  {order.orderType === "table" && order.table && (
                    <span className="ml-2 text-sm text-muted-foreground">Mesa {order.table.number}</span>
                  )}
                </h3>
                <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
              </div>
              {getStatusBadge(order.status)}
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatCurrency(order.total)}</div>
              <p className="text-sm text-muted-foreground">{getPaymentMethodLabel(order.methodType)}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{order.customer?.fullName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{order.customer?.phone}</span>
              </div>
            </div>

            {order.orderType === "delivery" && order.addressStreet && (
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <div>
                      {order.addressStreet}, {order.addressNumber}
                    </div>
                    <div>
                      {order.addressNeighborhood} - CEP: {order.addressCep}
                    </div>
                    {order.addressComplement && (
                      <div className="text-muted-foreground">Complemento: {order.addressComplement}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {order.orderType === "table" && order.table && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Mesa {order.table.number}</span>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Itens do Pedido:</h4>
              <div className="space-y-1">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.product?.name}
                    </span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          {order.additionalInfo && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-sm mb-1">Informações Adicionais:</h4>
              <p className="text-sm text-muted-foreground">{order.additionalInfo}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            {getStatusActions(order)}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Detalhes do Pedido #{order.id}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Status</Label>
                      <div className="mt-1">{getStatusBadge(order.status)}</div>
                    </div>
                    <div>
                      <Label>Tipo</Label>
                      <p className="mt-1">{order.orderType === "delivery" ? "Delivery" : "Mesa"}</p>
                    </div>
                    <div>
                      <Label>Data/Hora</Label>
                      <p className="mt-1">{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
                    </div>
                    <div>
                      <Label>Total</Label>
                      <p className="mt-1 font-bold">{formatCurrency(order.total)}</p>
                    </div>
                  </div>

                  <div>
                    <Label>Cliente</Label>
                    <p className="mt-1">
                      {order.customer?.fullName} - {order.customer?.phone}
                    </p>
                  </div>

                  {order.orderType === "delivery" && order.addressStreet && (
                    <div>
                      <Label>Endereço de Entrega</Label>
                      <p className="mt-1">
                        {order.addressStreet}, {order.addressNumber}
                        <br />
                        {order.addressNeighborhood} - CEP: {order.addressCep}
                        {order.addressComplement && (
                          <>
                            <br />
                            Complemento: {order.addressComplement}
                          </>
                        )}
                      </p>
                    </div>
                  )}

                  {order.orderType === "table" && order.table && (
                    <div>
                      <Label>Mesa</Label>
                      <p className="mt-1">Mesa {order.table.number}</p>
                    </div>
                  )}

                  <div>
                    <Label>Itens do Pedido</Label>
                    <div className="mt-1 space-y-2">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between p-2 bg-muted rounded">
                          <span>
                            {item.quantity}x {item.product?.name}
                          </span>
                          <span>{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {order.additionalInfo && (
                    <div>
                      <Label>Observações</Label>
                      <p className="mt-1">{order.additionalInfo}</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestão de Pedidos</h2>
          <p className="text-muted-foreground">Gerencie todos os pedidos do seu restaurante</p>
        </div>
        <div className="flex items-center space-x-2">
          {newOrdersCount > 0 && (
            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
              <BellRing className="h-4 w-4" />
              <span className="text-sm font-medium">{newOrdersCount} novos</span>
              <Button size="sm" variant="ghost" onClick={() => setNewOrdersCount(0)} className="h-6 w-6 p-0">
                ×
              </Button>
            </div>
          )}
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente, telefone ou mesa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pendentes
              </Button>
              <Button
                variant={statusFilter === "preparing" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("preparing")}
              >
                Preparando
              </Button>
              <Button
                variant={statusFilter === "delivered" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("delivered")}
              >
                Entregues
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Todos ({orders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center space-x-2">
            <Truck className="h-4 w-4" />
            <span>Delivery ({deliveryOrders.length})</span>
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center space-x-2">
            <UtensilsCrossed className="h-4 w-4" />
            <span>Mesas ({tableOrders.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {getFilteredOrders(orders).length > 0 ? (
            getFilteredOrders(orders).map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Aguarde novos pedidos chegarem"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          {getFilteredOrders(deliveryOrders).length > 0 ? (
            getFilteredOrders(deliveryOrders).map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido de delivery</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Aguarde novos pedidos de delivery chegarem"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          {getFilteredOrders(tableOrders).length > 0 ? (
            getFilteredOrders(tableOrders).map((order) => <OrderCard key={order.id} order={order} />)
          ) : (
            <div className="text-center py-12">
              <UtensilsCrossed className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">Nenhum pedido de mesa</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Aguarde novos pedidos de mesa chegarem"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default OrdersTabImproved
