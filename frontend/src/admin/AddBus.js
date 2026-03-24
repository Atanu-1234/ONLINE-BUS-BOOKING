import api from "../utils/api";

export default function AddBus() {
  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    await api.post("/bus/add", data);
    alert("Bus Added");
  };

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6">
      <input name="operator" placeholder="Operator" className="border p-2 w-full mb-2" />
      <input name="from" placeholder="From" className="border p-2 w-full mb-2" />
      <input name="to" placeholder="To" className="border p-2 w-full mb-2" />
      <input name="price" placeholder="Price" className="border p-2 w-full mb-2" />
      <button className="bg-indigo-600 text-white p-2 w-full">Add Bus</button>
    </form>
  );
}
