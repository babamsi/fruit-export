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
import { Textarea } from '@/components/ui/textarea';
import { useSupplierStore } from '@/lib/stores/supplierStore';
import type { Supplier } from '@/lib/types';
import { toast } from 'sonner';

interface SupplierFormProps {
  supplier?: Supplier;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fruitTypes = [
  'Apples',
  'Bananas',
  'Oranges',
  'Grapes',
  'Mangoes',
  'Pineapples',
  'Berries',
  'Avocados',
];

export function SupplierForm({ supplier, open, onOpenChange }: SupplierFormProps) {
  const addSupplier = useSupplierStore((state) => state.addSupplier);
  const updateSupplier = useSupplierStore((state) => state.updateSupplier);

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    fruitSpecialties: [] as string[],
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        contact: supplier.contact,
        email: supplier.email,
        phone: supplier.phone,
        fruitSpecialties: supplier.fruitSpecialties,
      });
    } else {
      setFormData({
        name: '',
        contact: '',
        email: '',
        phone: '',
        fruitSpecialties: [],
      });
    }
  }, [supplier, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.contact || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (supplier) {
      updateSupplier(supplier.id, formData);
      toast.success('Supplier updated successfully');
    } else {
      addSupplier(formData);
      toast.success('Supplier added successfully');
    }

    onOpenChange(false);
  };

  const toggleFruitType = (fruitType: string) => {
    setFormData((prev) => ({
      ...prev,
      fruitSpecialties: prev.fruitSpecialties.includes(fruitType)
        ? prev.fruitSpecialties.filter((f) => f !== fruitType)
        : [...prev.fruitSpecialties, fruitType],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{supplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
          <DialogDescription>
            {supplier
              ? 'Update supplier information below.'
              : 'Add a new supplier to your system.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact Person *</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, contact: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fruit Specialties</Label>
            <div className="flex flex-wrap gap-2">
              {fruitTypes.map((fruitType) => (
                <Button
                  key={fruitType}
                  type="button"
                  variant={
                    formData.fruitSpecialties.includes(fruitType)
                      ? 'default'
                      : 'outline'
                  }
                  size="sm"
                  onClick={() => toggleFruitType(fruitType)}
                >
                  {fruitType}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{supplier ? 'Update' : 'Add'} Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



