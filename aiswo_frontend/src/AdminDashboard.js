import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "./components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./components/ui/card"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { Badge } from "./components/ui/badge"
import { Trash2, Edit, Plus, MapPin, Database, User } from "lucide-react"
import { API_CONFIG } from './config';

function AdminDashboard() {
  const [bins, setBins] = useState({});
  const [operators, setOperators] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBinForm, setShowBinForm] = useState(false);
  const [showOperatorForm, setShowOperatorForm] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [editingOperator, setEditingOperator] = useState(null);

  const [binForm, setBinForm] = useState({
    id: '',
    name: '',
    location: '',
    capacity: '',
    operatorId: '',
    status: 'Active'
  });

  const [operatorForm, setOperatorForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    assignedBins: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [binsResponse, operatorsResponse] = await Promise.all([
        axios.get(`${API_CONFIG.BACKEND_URL}/bins`),
        axios.get(`${API_CONFIG.BACKEND_URL}/operators`)
      ]);
      setBins(binsResponse.data);
      setOperators(operatorsResponse.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBinSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingBin) {
        await axios.put(`${API_CONFIG.BACKEND_URL}/bins/${editingBin}`, binForm);
      } else {
        await axios.post(`${API_CONFIG.BACKEND_URL}/bins`, binForm);
      }
      fetchData();
      setShowBinForm(false);
      setEditingBin(null);
      setBinForm({ id: '', name: '', location: '', capacity: '', operatorId: '', status: 'Active' });
    } catch (error) {
      console.error('Error saving bin:', error);
    }
  };

  const handleOperatorSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingOperator) {
        await axios.put(`${API_CONFIG.BACKEND_URL}/operators/${editingOperator}`, operatorForm);
      } else {
        await axios.post(`${API_CONFIG.BACKEND_URL}/operators`, operatorForm);
      }
      fetchData();
      setShowOperatorForm(false);
      setEditingOperator(null);
      setOperatorForm({ id: '', name: '', email: '', phone: '', password: '', assignedBins: [] });
    } catch (error) {
      console.error('Error saving operator:', error);
    }
  };

  const handleEditBin = (binId) => {
    const bin = bins[binId];
    setBinForm({
      id: binId,
      name: bin.name || binId,
      location: bin.location || '',
      capacity: bin.capacity || '',
      operatorId: bin.operatorId || '',
      status: bin.status || 'Active'
    });
    setEditingBin(binId);
    setShowBinForm(true);
  };

  const handleEditOperator = (operatorId) => {
    const operator = operators[operatorId];
    setOperatorForm({
      id: operatorId,
      name: operator.name || '',
      email: operator.email || '',
      phone: operator.phone || '',
      password: '', // Don't show existing password
      assignedBins: operator.assignedBins || []
    });
    setEditingOperator(operatorId);
    setShowOperatorForm(true);
  };

  const handleDeleteBin = async (binId) => {
    if (window.confirm('Are you sure you want to delete this bin?')) {
      try {
        await axios.delete(`${API_CONFIG.BACKEND_URL}/bins/${binId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting bin:', error);
      }
    }
  };

  const handleDeleteOperator = async (operatorId) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        await axios.delete(`${API_CONFIG.BACKEND_URL}/operators/${operatorId}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting operator:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="text-center mb-10 space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage bins, operators, and system settings
        </p>
      </div>

      <Tabs defaultValue="bins" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="bins">Bins Management</TabsTrigger>
            <TabsTrigger value="operators">Operators Management</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="bins" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Smart Bins ({Object.keys(bins).length})
            </h2>
            <Button onClick={() => {
              setEditingBin(null);
              setBinForm({ id: '', name: '', location: '', capacity: '', operatorId: '', status: 'Active' });
              setShowBinForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Bin
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(bins).map(([binId, bin]) => (
              <Card key={binId} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-primary">
                      {bin.name || binId.toUpperCase()}
                    </CardTitle>
                    <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bin.fillPct > 80 ? 'bg-destructive/10 text-destructive' : 
                      bin.fillPct > 60 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-green-100 text-green-800'
                    }`}>
                      {bin.fillPct || 0}% Full
                    </div>
                  </div>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 mr-1" /> {bin.location || 'Not set'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <Database className="h-3 w-3 mr-1" /> Capacity:
                      </span>
                      <span className="font-medium">{bin.capacity || 'N/A'} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center">
                        <User className="h-3 w-3 mr-1" /> Operator:
                      </span>
                      <span className="font-medium">
                        {bin.operatorId ? operators[bin.operatorId]?.name || bin.operatorId : 'Unassigned'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleEditBin(binId)}>
                    <Edit className="h-3 w-3 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleDeleteBin(binId)}>
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="operators" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Operators ({Object.keys(operators).length})
            </h2>
            <Button onClick={() => {
              setEditingOperator(null);
              setOperatorForm({ id: '', name: '', email: '', phone: '', password: '', assignedBins: [] });
              setShowOperatorForm(true);
            }}>
              <Plus className="mr-2 h-4 w-4" /> Add New Operator
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(operators).map(([operatorId, operator]) => (
              <Card key={operatorId} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl font-bold text-primary">
                      {operator.name}
                    </CardTitle>
                    <div className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
                      Active
                    </div>
                  </div>
                  <CardDescription>{operator.email}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{operator.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned Bins:</span>
                      <span className="font-medium">{operator.assignedBins?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2 pt-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleEditOperator(operatorId)}>
                    <Edit className="h-3 w-3 mr-2" /> Edit
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleDeleteOperator(operatorId)}>
                    <Trash2 className="h-3 w-3 mr-2" /> Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bin Form Dialog */}
      <Dialog open={showBinForm} onOpenChange={setShowBinForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBin ? 'Edit Bin' : 'Add New Bin'}</DialogTitle>
            <DialogDescription>
              {editingBin ? 'Update the details of the smart bin.' : 'Enter the details for the new smart bin.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBinSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="binId">Bin ID</Label>
              <Input
                id="binId"
                value={binForm.id}
                onChange={(e) => setBinForm({...binForm, id: e.target.value})}
                required
                disabled={!!editingBin}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={binForm.name}
                onChange={(e) => setBinForm({...binForm, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={binForm.location}
                onChange={(e) => setBinForm({...binForm, location: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (kg)</Label>
              <Input
                id="capacity"
                type="number"
                value={binForm.capacity}
                onChange={(e) => setBinForm({...binForm, capacity: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Select 
                value={binForm.operatorId} 
                onValueChange={(value) => setBinForm({...binForm, operatorId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {Object.entries(operators).map(([id, operator]) => (
                    <SelectItem key={id} value={id}>{operator.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowBinForm(false)}>Cancel</Button>
              <Button type="submit">{editingBin ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Operator Form Dialog */}
      <Dialog open={showOperatorForm} onOpenChange={setShowOperatorForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingOperator ? 'Edit Operator' : 'Add New Operator'}</DialogTitle>
            <DialogDescription>
              {editingOperator ? 'Update the operator details.' : 'Enter the details for the new operator.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOperatorSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="operatorId">Operator ID</Label>
              <Input
                id="operatorId"
                value={operatorForm.id}
                onChange={(e) => setOperatorForm({...operatorForm, id: e.target.value})}
                required
                disabled={!!editingOperator}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="operatorName">Name</Label>
              <Input
                id="operatorName"
                value={operatorForm.name}
                onChange={(e) => setOperatorForm({...operatorForm, name: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={operatorForm.email}
                onChange={(e) => setOperatorForm({...operatorForm, email: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={operatorForm.phone}
                onChange={(e) => setOperatorForm({...operatorForm, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {editingOperator && '(Leave blank to keep current)'}</Label>
              <Input
                id="password"
                type="password"
                value={operatorForm.password}
                onChange={(e) => setOperatorForm({...operatorForm, password: e.target.value})}
                required={!editingOperator} // Required only for new operators
                placeholder={editingOperator ? "Enter new password to change" : "Enter password"}
              />
            </div>
            <div className="space-y-2">
              <Label>Assigned Bins</Label>
              <div className="border rounded-md p-3 space-y-2">
                {Object.keys(bins).length > 0 ? (
                  Object.entries(bins).map(([binId, bin]) => (
                    <div key={binId} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`bin-${binId}`}
                        checked={operatorForm.assignedBins.includes(binId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setOperatorForm({
                              ...operatorForm,
                              assignedBins: [...operatorForm.assignedBins, binId]
                            });
                          } else {
                            setOperatorForm({
                              ...operatorForm,
                              assignedBins: operatorForm.assignedBins.filter(b => b !== binId)
                            });
                          }
                        }}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <label htmlFor={`bin-${binId}`} className="text-sm cursor-pointer flex-1">
                        {binId.toUpperCase()} - {bin.name || bin.location || 'Unknown'}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No bins available</p>
                )}
              </div>
              {operatorForm.assignedBins.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Selected:</span>
                  {operatorForm.assignedBins.map(binId => (
                    <Badge key={binId} variant="secondary">
                      {binId.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowOperatorForm(false)}>Cancel</Button>
              <Button type="submit">{editingOperator ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminDashboard;
