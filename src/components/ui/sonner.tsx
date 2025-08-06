import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg [&>div]:text-black",
          success: "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-green-200 group-[.toaster]:shadow-lg [&>div]:text-black",
          error: "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-red-200 group-[.toaster]:shadow-lg [&>div]:text-black",
          info: "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-blue-200 group-[.toaster]:shadow-lg [&>div]:text-black",
          warning: "group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-yellow-200 group-[.toaster]:shadow-lg [&>div]:text-black",
          description: "group-[.toast]:text-gray-900",
          title: "group-[.toast]:text-black group-[.toast]:font-semibold",
          actionButton: "group-[.toast]:bg-gray-900 group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
