"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { accountSchema } from "@/schema/accountSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select } from "./ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "./ui/switch";
import MoreInfoToolTip from "./moreInfoToolTip";
import { createAccount, IACCOUNT } from "@/actions/Account";
import { toast } from "sonner";
import { Info, Loader } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch-hook";

function CreateAccountDrawer({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState<boolean>(false);
  const { loading, error, fetch, data: fetchResult } = useFetch(createAccount);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (error) toast.error("Something went wrong");
    else if (!loading && fetchResult) {
      toast.success("Account created successfully");
      console.log("fetch result:", fetchResult);
      setOpen(false);
      reset();
    }
  }, [fetchResult, error, loading, reset, setOpen]);

  const onSubmit = async (data: IACCOUNT) => {
    // setIsSubmitting(true);
    console.log(data);
    await fetch(data);
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>

      <DrawerContent className="px-2">
        <DrawerDescription className="hidden">
          A drawer for account creation
        </DrawerDescription>
        <div className="container mx-auto space-y-10">
          <DrawerTitle>Create Account</DrawerTitle>

          <div>
            <form className="space-y-3 mb-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Account Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g, Main Account"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-sm font-medium">
                  Account Type
                </Label>
                <Select
                  onValueChange={(value: "CURRENT" | "SAVINGS") =>
                    setValue("type", value)
                  }
                  defaultValue={watch("type")}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CURRENT">Current</SelectItem>
                    <SelectItem value="SAVINGS">Savings</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="balance" className="text-sm font-medium">
                  Account Balance
                </Label>
                <Input
                  id="balance"
                  type="number"
                  step={0.1}
                  defaultValue={0.0}
                  {...register("balance")}
                />
                {errors.balance && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.balance.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="isDefault"
                  className="text-sm font-medium flex gap-0.5"
                >
                  <span>Set as Default</span>
                  <MoreInfoToolTip
                    infoText={
                      <p className="text-sm">
                        This account will be selected by default for
                        transactions
                      </p>
                    }
                    trigger={<Info size={18} fill="black" color="white" />}
                  />
                </Label>

                <Switch
                  checked={watch("isDefault")}
                  id="isDefault"
                  onCheckedChange={(checked: boolean) =>
                    setValue("isDefault", checked)
                  }
                />
                {errors.isDefault && (
                  <p className="text-sm font-medium text-red-500">
                    {errors.isDefault.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  disabled={loading}
                  type={"submit"}
                  size="lg"
                  className={`flex-1 ${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" /> Creating
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
                <DrawerClose asChild>
                  <Button size="lg" className="flex-1" variant={"secondary"}>
                    Close
                  </Button>
                </DrawerClose>
              </div>
            </form>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
export default CreateAccountDrawer;
