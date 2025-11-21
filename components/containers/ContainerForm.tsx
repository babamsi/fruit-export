'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContainerStore } from '@/lib/stores/containerStore';
import type { Container, Consignee } from '@/lib/types';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface ContainerFormProps {
  container?: Container;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContainerForm({ container, open, onOpenChange }: ContainerFormProps) {
  const addContainer = useContainerStore((state) => state.addContainer);
  const updateContainer = useContainerStore((state) => state.updateContainer);

  const [formData, setFormData] = useState({
    containerNumber: '',
    status: 'Preparing' as Container['status'],
    shipDate: '',
    deliveryDate: '',
  });

  const [consigneeData, setConsigneeData] = useState<Consignee>({
    name: '',
    company: '',
    location: '',
    city: '',
    country: '',
    email: '',
    phone: '',
    additionalInfo: '',
  });

  useEffect(() => {
    if (container) {
      setFormData({
        containerNumber: container.containerNumber,
        status: container.status,
        shipDate: container.shipDate?.split('T')[0] || '',
        deliveryDate: container.deliveryDate?.split('T')[0] || '',
      });
      setConsigneeData(
        container.consignee || {
          name: '',
          company: '',
          location: '',
          city: '',
          country: '',
          email: '',
          phone: '',
          additionalInfo: '',
        }
      );
    } else {
      setFormData({
        containerNumber: '',
        status: 'Preparing',
        shipDate: '',
        deliveryDate: '',
      });
      setConsigneeData({
        name: '',
        company: '',
        location: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        additionalInfo: '',
      });
    }
  }, [container, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.containerNumber) {
      toast.error('Please enter a container number');
      return;
    }

    // Get existing suppliers from supplies if editing, or keep empty array for new containers
    const existingSuppliers: ContainerSupplier[] = container?.suppliers || [];

    // Only include consignee if at least name or company is filled
    const consignee: Consignee | undefined =
      consigneeData.name.trim() || consigneeData.company.trim()
        ? {
            name: consigneeData.name.trim(),
            company: consigneeData.company.trim(),
            location: consigneeData.location.trim(),
            city: consigneeData.city?.trim() || undefined,
            country: consigneeData.country?.trim() || undefined,
            email: consigneeData.email?.trim() || undefined,
            phone: consigneeData.phone?.trim() || undefined,
            additionalInfo: consigneeData.additionalInfo?.trim() || undefined,
          }
        : undefined;

    const containerData = {
      containerNumber: formData.containerNumber,
      status: formData.status,
      suppliers: existingSuppliers, // Keep existing suppliers (they come from /supply page)
      consignee,
      shipDate: formData.shipDate ? new Date(formData.shipDate).toISOString() : undefined,
      deliveryDate: formData.deliveryDate ? new Date(formData.deliveryDate).toISOString() : undefined,
    };

    if (container) {
      updateContainer(container.id, containerData);
      toast.success('Container updated successfully');
    } else {
      const newContainerId = crypto.randomUUID();
      addContainer({
        ...containerData,
        id: newContainerId,
      } as any);
      toast.success('Container created successfully. Add suppliers via the Supply page.');
    }

    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{container ? 'Edit Container' : 'Add New Container'}</DialogTitle>
          <DialogDescription>
            {container
              ? 'Update container information. Suppliers and fruit supplies are managed via the Supply page.'
              : 'Create a new container with consignee information. Add suppliers and fruit supplies later via the Supply page.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="containerNumber">Container Number *</Label>
              <Input
                id="containerNumber"
                value={formData.containerNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, containerNumber: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as Container['status'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Preparing">Preparing</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipDate">Ship Date</Label>
              <Input
                id="shipDate"
                type="date"
                value={formData.shipDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, shipDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliveryDate">Delivery Date</Label>
            <Input
              id="deliveryDate"
              type="date"
              value={formData.deliveryDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))
              }
            />
          </div>

          {/* Consignee Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Consignee Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Add details about the person/company receiving this container
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consigneeName">Consignee Name</Label>
                    <Input
                      id="consigneeName"
                      value={consigneeData.name}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Person/Contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consigneeCompany">Company Name</Label>
                    <Input
                      id="consigneeCompany"
                      value={consigneeData.company}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, company: e.target.value }))
                      }
                      placeholder="Company name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consigneeLocation">Location/Address</Label>
                  <Input
                    id="consigneeLocation"
                    value={consigneeData.location}
                    onChange={(e) =>
                      setConsigneeData((prev) => ({ ...prev, location: e.target.value }))
                    }
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consigneeCity">City</Label>
                    <Input
                      id="consigneeCity"
                      value={consigneeData.city || ''}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, city: e.target.value }))
                      }
                      placeholder="City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consigneeCountry">Country</Label>
                    <Input
                      id="consigneeCountry"
                      value={consigneeData.country || ''}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, country: e.target.value }))
                      }
                      placeholder="Country"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="consigneeEmail">Email</Label>
                    <Input
                      id="consigneeEmail"
                      type="email"
                      value={consigneeData.email || ''}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, email: e.target.value }))
                      }
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="consigneePhone">Phone</Label>
                    <Input
                      id="consigneePhone"
                      type="tel"
                      value={consigneeData.phone || ''}
                      onChange={(e) =>
                        setConsigneeData((prev) => ({ ...prev, phone: e.target.value }))
                      }
                      placeholder="Phone number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consigneeAdditionalInfo">Additional Information</Label>
                  <Textarea
                    id="consigneeAdditionalInfo"
                    value={consigneeData.additionalInfo || ''}
                    onChange={(e) =>
                      setConsigneeData((prev) => ({ ...prev, additionalInfo: e.target.value }))
                    }
                    placeholder="Any additional notes or information about the consignee"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suppliers Info - Read Only */}
          {container && container.suppliers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Suppliers & Fruit Supplies</h3>
                    <p className="text-sm text-muted-foreground">
                      This container has {container.suppliers.length} supplier entr{container.suppliers.length === 1 ? 'y' : 'ies'}.
                      Manage suppliers via the Supply page.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {container.suppliers.slice(0, 3).map((supplier, index) => (
                      <div key={index} className="flex items-center gap-4 text-sm p-2 bg-muted rounded">
                        <span className="font-medium">{supplier.supplierName}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>{supplier.fruitType}</span>
                        <span className="text-muted-foreground">-</span>
                        <span>Qty: {supplier.quantity.toLocaleString()}</span>
                        <span className="ml-auto font-medium">{supplier.amount.toLocaleString()} USD</span>
                      </div>
                    ))}
                    {container.suppliers.length > 3 && (
                      <p className="text-sm text-muted-foreground text-center">
                        +{container.suppliers.length - 3} more entr{container.suppliers.length - 3 === 1 ? 'y' : 'ies'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{container ? 'Update' : 'Create'} Container</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

