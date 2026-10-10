type LoadingSpinnerProps = {
message?: string;
fullScreen?: boolean;
};

export default function LoadingSpinner({
message = "A carregar dados...",
fullScreen = false,
}: LoadingSpinnerProps) {
return (
<div
role="status"
className={`flex flex-col items-center justify-center gap-3 ${
        fullScreen ? "min-h-screen" : "min-h-[200px] w-full"
      }`}
> <div className="size-10 animate-spin rounded-full border-4 border-[#dce9df] border-t-[#145a43]" />


  <p className="text-sm font-medium text-[#64736b]">{message}</p>
</div>

);
}
