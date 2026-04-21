import Swal from "sweetalert2";

const toastBaseConfig = {
  toast: true,
  position: "top-end" as const,
  showConfirmButton: false,
  timer: 1800,
  timerProgressBar: true,
};

export async function showAuthErrorAlert(message: string): Promise<void> {
  await Swal.fire({
    icon: "error",
    title: "Action couldn't be completed",
    text: message,
    confirmButtonColor: "#1d3b66",
  });
}

export async function showAuthErrorToast(
  title: string,
  message?: string
): Promise<void> {
  await Swal.fire({
    ...toastBaseConfig,
    icon: "error",
    title,
    text: message,
  });
}

export async function showAuthInfoAlert(
  title: string,
  message: string
): Promise<void> {
  await Swal.fire({
    icon: "info",
    title,
    text: message,
    confirmButtonColor: "#1d3b66",
  });
}

export async function showAuthInfoToast(
  title: string,
  message?: string
): Promise<void> {
  await Swal.fire({
    ...toastBaseConfig,
    icon: "info",
    title,
    text: message,
  });
}

export async function showAuthSuccessAlert(
  title: string,
  message: string
): Promise<void> {
  await Swal.fire({
    icon: "success",
    title,
    text: message,
    confirmButtonColor: "#1d3b66",
  });
}

export async function showAuthSuccessToast(
  title: string,
  message?: string
): Promise<void> {
  await Swal.fire({
    ...toastBaseConfig,
    icon: "success",
    title,
    text: message,
  });
}
