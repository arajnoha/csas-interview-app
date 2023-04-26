import { FieldValues, useForm } from "react-hook-form";

interface Props {
  onSubmit: (data: FieldValues) => void;
  list: string[];
}

const Form = ({ onSubmit, list }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm();

  return (
    <>
      <p>
        Pomocí naší aplikace Vám najdeme nejrychlejší cestu k Vaším penězům.
        Začněte výběrem kraje.
      </p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="kraj">Váš kraj:</label>
        <select
          {...register("kraj", { required: true })}
          aria-label="Vyberte Váš kraj s nabídky"
        >
          <option value="">Kliknutím sem zobrazíte možnosti</option>
          {list.map((kraj) => (
            <option key={kraj} value={kraj}>
              {kraj}
            </option>
          ))}
        </select>
        <button type="submit" disabled={!isValid}>
          Pokračovat
        </button>
      </form>
    </>
  );
};

export default Form;
