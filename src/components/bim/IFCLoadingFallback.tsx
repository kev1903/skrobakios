
interface IFCLoadingFallbackProps {
  className?: string;
}

export const IFCLoadingFallback = ({ className }: IFCLoadingFallbackProps) => {
  return (
    <div className={`${className} flex items-center justify-center bg-slate-100`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Loading IFC Model...</p>
      </div>
    </div>
  );
};
