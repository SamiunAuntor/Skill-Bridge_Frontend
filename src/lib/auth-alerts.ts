import Swal from "sweetalert2";

export async function showAuthErrorAlert(message: string): Promise<void> {
  await Swal.fire({
    icon: "error",
    title: "Action couldn't be completed",
    text: message,
    confirmButtonColor: "#1d3b66",
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
