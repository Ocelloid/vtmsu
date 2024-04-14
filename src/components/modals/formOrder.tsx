import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { useState } from "react";
// import { api } from "~/utils/api";
import { FaShoppingCart } from "react-icons/fa";
// import { LoadingSpinner } from "~/components/Loading";
// import { FaRubleSign } from "react-icons/fa";

const FormOrder = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");

  //   const { mutate: createMutation, isPending } =
  //     api.shop.createProduct.useMutation();

  // const resetForm = () => {
  //   setAddress("");
  //   setDescription("");
  // };

  const handleFormSubmit = () => {
    // createMutation(
    //   {
    //     title: title,
    //     description: description,
    //     subtitle: subtitle,
    //     price: Number(price),
    //     stock: Number(stock),
    //     images: [],
    //   },
    //   {
    //     onSuccess() {
    //       resetForm();
    //       setIsModalOpen(false);
    //     },
    //   },
    // );
  };

  return (
    <>
      <Modal
        isOpen={isModalOpen}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        onOpenChange={() => setIsModalOpen(!isModalOpen)}
        size="2xl"
        placement="top-center"
        backdrop="blur"
        classNames={{
          body: "py-6",
          base: "bg-red-950 bg-opacity-95 text-neutral-100",
          closeButton: "hover:bg-white/5 active:bg-white/10 w-12 h-12 p-4",
        }}
      >
        <ModalContent>
          <ModalHeader>Оформить заказ</ModalHeader>
          <ModalBody>
            <Input
              variant="underlined"
              label="Адрес"
              placeholder="Введите ваш адрес"
              value={address}
              onValueChange={setAddress}
            />
            <Textarea
              variant="bordered"
              label="Комментарий"
              placeholder="Введите комментарий к заказу"
              value={description}
              onValueChange={setDescription}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="mr-auto"
            >
              Отменить
            </Button>
            <Button
              variant="solid"
              color="success"
              //   isDisabled={isPending || !address || !description}
              onClick={handleFormSubmit}
            >
              Оплатить
              {/* {isPending ? <LoadingSpinner /> : "Оплатить"} */}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="flex w-full flex-row gap-0 rounded-none bg-transparent text-red-100"
      >
        <FaShoppingCart size={24} />
        &nbsp; Оформить заказ
      </Button>
    </>
  );
};

export default FormOrder;
