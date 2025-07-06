import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TabConfirmDialogsProps {
  deleteConfirmTab: string | null;
  clearConfirmTab: string | null;
  onDeleteCancel: () => void;
  onDeleteConfirm: (tabId: string) => void;
  onClearCancel: () => void;
  onClearConfirm: (tabId: string) => void;
}

export const TabConfirmDialogs = ({
  deleteConfirmTab,
  clearConfirmTab,
  onDeleteCancel,
  onDeleteConfirm,
  onClearCancel,
  onClearConfirm
}: TabConfirmDialogsProps) => {
  return (
    <>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmTab} onOpenChange={onDeleteCancel}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Table</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to delete this table? This action cannot be undone and all data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onDeleteCancel}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteConfirmTab && onDeleteConfirm(deleteConfirmTab)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear Data Confirmation Dialog */}
      <AlertDialog open={!!clearConfirmTab} onOpenChange={onClearCancel}>
        <AlertDialogContent className="bg-slate-800 border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Clear Table Data</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-300">
              Are you sure you want to clear all data from this table? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={onClearCancel}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => clearConfirmTab && onClearConfirm(clearConfirmTab)}
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};