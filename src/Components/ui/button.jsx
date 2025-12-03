function Button(props) {
  return (
    <button {...props} className="bg-blue-600 text-white p-2 rounded">
      {props.children}
    </button>
  );
}

export default Button;
export { Button };
