export default function({ store, redirect, error }) {
  // If the user is not authenticated
  if (!store.state.auth.loggedIn) {
    return redirect('/login')
  }

  if (store.state.auth.user.role !== 'admin') {
    return error({ statusCode: 403 })
  }
}
