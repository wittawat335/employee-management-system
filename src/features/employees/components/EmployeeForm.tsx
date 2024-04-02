import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { messages } from "@/config/messages";
import { IEmployee } from "@/types/Employee";
import { EmployeeSchema, EmployeeValidation } from "@/lib/validation/schema";
import { Button, Grid, Stack } from "@mui/material";
import { ActiveItems, GenderItems } from "@/data/data";
import { useGetDepartmentsQuery } from "@/features/department/services/departmentApi";
import {
  useAddEmployeeMutation,
  useUpdateEmployeeMutation,
} from "../services/employeeApi";
import {
  MuiRadioGroup,
  MuiSelectField,
  MuiTextField,
  MuiTextFieldArea,
  MuiTextFieldReadOnly,
} from "@/components/shared";
import { constants } from "@/config/constants";
import { IAuth } from "@/types/Auth";

interface FormProps {
  user: IAuth | null;
  isAction: string;
  dataToEdit: IEmployee | undefined;
  onClose: () => void;
}

const EmployeeForm = ({ onClose, user, dataToEdit, isAction }: FormProps) => {
  const { data: Departments, isSuccess: fetchingSuccess } =
    useGetDepartmentsQuery();
  const [addEmployee, { isSuccess: addSuccess }] = useAddEmployeeMutation();
  const [updateEmployee, { isSuccess: updateSuccess }] =
    useUpdateEmployeeMutation();

  const methods = useForm<EmployeeSchema>({
    resolver: zodResolver(EmployeeValidation),
    defaultValues: {
      employeeId: "",
      departmentId: "",
      gender: "M",
      active: "1",
      createdBy: user?.username,
      modifiedBy: user?.username,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;

  const submit = async (request: EmployeeSchema) => {
    try {
      isAction == "New"
        ? await addEmployee(request)
        : await updateEmployee(request);
    } catch (error) {
      console.log({ error });
    }
  };

  const testSubmit = useCallback((values: EmployeeSchema) => {
    window.alert(JSON.stringify(values, null, 4));
  }, []);

  useEffect(() => {
    reset(dataToEdit);
  }, [reset]);

  useEffect(() => {
    if (addSuccess) {
      toast.success(messages.add_success);
      onClose();
    }
  }, [addSuccess]);

  useEffect(() => {
    if (updateSuccess) {
      toast.success(messages.update_success);
      onClose();
    }
  }, [updateSuccess]);

  return (
    <form onSubmit={handleSubmit(submit)}>
      <Grid container>
        {" "}
        <Grid item xs={12} sm={12} md={6}>
          <Stack spacing={2} margin={2}>
            {isAction != constants.New ? (
              <MuiTextFieldReadOnly
                name={"employeeId"}
                label={"EmployeeId"}
                control={control}
              />
            ) : null}

            <MuiTextField
              name={"firstName"}
              label={"First Name"}
              control={control}
              isAction={isAction}
            />

            <MuiTextField
              name={"phoneNumber"}
              label={"Phone Number"}
              control={control}
              isAction={isAction}
            />
            {fetchingSuccess ? (
              <MuiSelectField
                name="departmentId"
                label="Department"
                isAction={isAction}
                control={control}
                options={Departments}
                optionLabel="departmentName"
              />
            ) : null}

            <MuiRadioGroup
              label={"Gender"}
              name="gender"
              options={GenderItems}
              control={control}
            />
          </Stack>
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
          <Stack spacing={2} margin={2}>
            <MuiTextField
              name={"email"}
              label={"E-mail"}
              control={control}
              isAction={isAction}
            />
            <MuiTextField
              name={"lastName"}
              label={"Last Name"}
              control={control}
              isAction={isAction}
            />
            <MuiTextFieldArea
              name={"address"}
              label={"Address"}
              control={control}
              isAction={isAction}
              rows={4}
              maxRows={4}
            />
            {isAction != constants.New ? (
              <MuiRadioGroup
                label={"Active"}
                name="active"
                options={ActiveItems}
                control={control}
              />
            ) : null}

            {isAction != constants.View ? (
              <Button variant="contained" type="submit" disabled={isSubmitting}>
                {isAction == constants.New ? "Save" : "Update"}
              </Button>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </form>
  );
};
export default EmployeeForm;
