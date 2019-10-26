import * as React from "react";
import classNames from "clsx";
import useForm from "react-hook-form";
import restrictWithTronWeb from "app/tron/restrictWithTronWeb";
import ContentContainer from "app/page/ContentContainer";
import Header from "app/page/Header";

const CreateChat = restrictWithTronWeb(() => {
  const { register, handleSubmit, errors } = useForm();
  const [members, setMembers] = React.useState(createArrayWithNumbers(1));
  const onSubmit = data => {
    alert(JSON.stringify(data));
  };

  const addMember = React.useCallback(() => {
    setMembers(currentMembers => [...currentMembers, currentMembers.length]);
  }, [setMembers]);

  const removeMember = React.useCallback(
    memberForRemove => {
      setMembers(currentMembers =>
        currentMembers.filter(mmbr => mmbr !== memberForRemove)
      );
    },
    [setMembers]
  );

  return (
    <ContentContainer>
      <Header showCreateChat={false} />

      <form
        className="w-full rounded-b overflow-hidden"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="p-4 bg-white">
          {members.map(member => {
            const removeDisabled = member === 0;
            const errored = Boolean(errors[member]);

            return (
              <div key={member} className="w-full mb-6">
                <label
                  className={classNames(
                    "block",
                    "mb-2",
                    "uppercase tracking-wide",
                    "text-gray-700 text-xs font-bold"
                  )}
                  htmlFor={`member-address-${member}`}
                >
                  {members.length > 1
                    ? `Member ${member + 1} address`
                    : "Member address"}
                </label>
                <div className="mb-2 flex items-stretch">
                  <input
                    ref={register({ required: true })}
                    className={classNames(
                      "appearance-none",
                      "block w-full",
                      "bg-gray-200 focus:bg-white focus:outline-none",
                      "border-2",
                      errored ? "border-red-500" : "border-gray-500",
                      "text-gray-700 rounded py-3 px-4 leading-tight"
                    )}
                    id={`member-address-${member}`}
                    type="text"
                    name={`address[${member}]`}
                    placeholder="TRHL8...AGf7aPd3Gq"
                  />
                  <button
                    type="button"
                    className={classNames(
                      "ml-2 w-16",
                      "border-2 border-gray-500",
                      "rounded",
                      "text-gray-500",
                      "flex items-center justify-center",
                      removeDisabled && "opacity-25"
                    )}
                    disabled={removeDisabled}
                    onClick={() => removeMember(member)}
                  >
                    <svg
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      aria-labelledby="minusIconTitle"
                      strokeWidth="2"
                      strokeLinecap="square"
                      strokeLinejoin="miter"
                      fill="none"
                      className="stroke-current"
                    >
                      <title id="minusIconTitle">Minus</title>
                      <path d="M20,12 L4,12" />
                    </svg>
                  </button>
                </div>
                {errored ? (
                  <p className="text-red-500 text-xs italic">
                    Please fill out this field.
                  </p>
                ) : null}
              </div>
            );
          })}

          <div className="mb-2 flex justify-center">
            <button
              type="button"
              className={classNames(
                "py-1 px-4",
                "border-2 border-gray-500",
                "rounded",
                "text-gray-500 text-base font-medium",
                "flex items-center"
              )}
              onClick={addMember}
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-labelledby="personAddIconTitle"
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
                fill="none"
                className="stroke-current"
              >
                <title id="personAddIconTitle">Add user</title>
                <path d="M1 18C1 15.75 4 15.75 5.5 14.25C6.25 13.5 4 13.5 4 9.75C4 7.25025 4.99975 6 7 6C9.00025 6 10 7.25025 10 9.75C10 13.5 7.75 13.5 8.5 14.25C10 15.75 13 15.75 13 18" />
                <path d="M22 11H14" />
                <path d="M18 7V15" />
              </svg>

              <span className="ml-1">Add one more Member</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-4">
          <button
            className={classNames(
              "bg-green-500 hover:bg-green-700 text-white text-base font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline",
              false && "opacity-50"
            )}
            type="submit"
            disabled={false}
          >
            {false ? "Sending..." : "Create Chat"}
          </button>
        </div>
      </form>
    </ContentContainer>
  );
});

export default CreateChat;

function createArrayWithNumbers(length) {
  return Array.from({ length }, (_, i) => i);
}
