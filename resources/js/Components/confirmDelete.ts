import Swal from 'sweetalert2'

export async function confirmDelete(entityName = 'item') {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: `You won't be able to revert this ${entityName}!`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it!',
  })

  return result.isConfirmed
}

export function showDeletedToast(title = 'Deleted!', text = 'Your item has been deleted.') {
  Swal.fire({
    title,
    text,
    icon: 'success',
  })
}

export async function confirmLogout() {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: "You won't be able to revert this!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, logout!',
  })

  return result.isConfirmed
}

export function showSavedToast(title = 'Your work has been saved') {
  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title,
    showConfirmButton: false,
    timer: 1500,
  })
}
