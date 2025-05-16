// 'use client'
// import React, {
//   createContext,
//   useContext,
//   useState,
//   useCallback,
//   ReactNode,
// } from "react";
// import { Checkbox } from "@/components/ui/checkbox";

// // Define types for our context
// type SelectionContextType = {
//   selectedIds: string[];
//   isSelected: (id: string) => boolean;
//   toggleSelection: (id: string) => void;
//   selectAll: (ids: string[]) => void;
//   clearSelection: () => void;
// };

// // Create the selection context with default values
// const SelectionContext = createContext<SelectionContextType | null>(null);

// interface SelectionProviderProps {
//   children: ReactNode;
// }

// function SelectionProvider({ children }: SelectionProviderProps) {
//   const [selectedIds, setSelectedIds] = useState<string[]>([]);

//   const isSelected = useCallback(
//     (id: string): boolean => {
//       return selectedIds.includes(id);
//     },
//     [selectedIds]
//   );

//   const toggleSelection = useCallback((id: string): void => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   }, []);

//   const selectAll = useCallback((ids: string[]): void => {
//     setSelectedIds(ids);
//   }, []);

//   const clearSelection = useCallback((): void => {
//     setSelectedIds([]);
//   }, []);

//   const value: SelectionContextType = {
//     selectedIds,
//     isSelected,
//     toggleSelection,
//     selectAll,
//     clearSelection,
//   };

//   return (
//     <SelectionContext.Provider value={value}>
//       {children}
//     </SelectionContext.Provider>
//   );
// }

// export  const MemoizedSelectionProvider = React.memo(SelectionProvider)

// export function useSelection(): SelectionContextType {
//   const context = useContext(SelectionContext);
//   if (!context) {
//     throw new Error("useSelection must be used within a SelectionProvider");
//   }
//   return context;
// }

// interface SelectCheckboxProps {
//   id: string;
// }

// // Custom SelectCheckbox component
// export function SelectCheckbox({ id }: SelectCheckboxProps) {
//   const { isSelected, toggleSelection } = useSelection();
//   const checked = isSelected(id);

//   return (
//     <Checkbox checked={checked} onCheckedChange={() => toggleSelection(id)} />
//   );
// }

// interface SelectAllCheckboxProps {
//   allIds: string[];
// }

// // Custom SelectAllCheckbox component
// export function SelectAllCheckbox({ allIds }: SelectAllCheckboxProps) {
//   const { selectedIds, selectAll, clearSelection } = useSelection();
//   const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;

//   const handleSelectAll = () => {
//     if (allSelected) {
//       clearSelection();
//     } else {
//       selectAll(allIds);
//     }
//   };

//   return <Checkbox checked={allSelected} onCheckedChange={handleSelectAll} />;
// }
