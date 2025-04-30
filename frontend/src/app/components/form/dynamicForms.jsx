import { useRef } from "react";
import { Controller } from 'react-hook-form';
import { SketchPicker } from 'react-color';
import { Input, Textarea, Checkbox, Button, Upload, Avatar } from "components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";
import { TextEditor } from "components/shared/form/TextEditor";
import { htmlToDelta } from "utils/quillUtils";
import { JWT_HOST_API } from 'configs/auth.config';
import { SearchSelect } from "./SearchSelect";
import { Table } from "./Table";

const editorModules = {
    toolbar: [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction
        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ font: [] }],
        [{ align: [] }, "image"],
        ["clean"], // remove formatting button
    ],
};

export default function DynamicForms({ infos, fields, register, control, errors, tables }) {
    const uploadRef = useRef();
    return (
        <div className="space-y-4">
            {fields.map((info) => {
                let item = infos && infos.find((item) => item.fieldname == info)
                if (item) {
                    return <div key={"field.name"} className="form-group">
                        {(() => {
                            switch (item.fieldtype) {

                                case 'Attach':
                                    return (
                                        <Controller
                                            render={({ field: { value, onChange } }) => {
                                                return <Upload onChange={onChange} ref={uploadRef} accept="image/*">
                                                    {({ ...props }) =>
                                                        value ? (
                                                            <Avatar
                                                                size={24}
                                                                src={`${JWT_HOST_API}${value}`}
                                                                classNames={{ display: "rounded-lg" }}
                                                            />
                                                        ) : (
                                                            <Button
                                                                unstyled
                                                                className="size-20 shrink-0 space-x-2 rounded-lg border-2 border-current p-0 text-gray-300 hover:text-primary-600 dark:text-dark-450 dark:hover:text-primary-500 "
                                                                {...props}
                                                            >
                                                                <PlusIcon className="size-6 stroke-2" />
                                                            </Button>
                                                        )
                                                    }
                                                </Upload>
                                            }}
                                            control={control}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Color':
                                    return (
                                        <Controller
                                            render={({ field: { value, onChange } }) => (
                                                <SketchPicker
                                                    color={value}
                                                    onChange={(val) => onChange(val.hex)}
                                                    placeholder={`Enter the ${item.label}`}
                                                    error={errors[item.fieldname]?.message}
                                                />
                                            )}
                                            control={control}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Data':
                                    return (
                                        <Controller
                                            render={({ field: { value } }) => (
                                                <Input
                                                    value={value}
                                                    label={item.label}
                                                    placeholder={`Enter the ${item.label}`}
                                                    {...register(item.fieldname)}
                                                    error={errors[item.fieldname]?.message}
                                                />
                                            )}
                                            control={control}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Check':
                                    return (
                                        <Checkbox
                                            label={item.label}
                                            {...register(item.fieldname)}
                                            error={errors[item.fieldname]?.message}
                                        />
                                    );

                                case 'Button':
                                    return (
                                        <Button
                                            color="warning"
                                            {...register(item.fieldname)}
                                            error={errors[item.fieldname]?.message}
                                        >{item.label}</Button>
                                    );

                                case 'Small Text':
                                    return (
                                        <Textarea
                                            rows={4}
                                            label={item.label}
                                            placeholder={`Enter the ${item.label}`}
                                            {...register(item.fieldname)}
                                            error={errors[item.fieldname]?.message}
                                        />
                                    );

                                case 'Text Editor':
                                    return (
                                        <Controller
                                            render={({ field: { value, onChange, ...rest } }) => {
                                                let newValue = typeof value === 'object' ? value.ops[0].insert : (value ? value : '')
                                                const html = `${newValue}`;
                                                console.log(html)
                                                return <TextEditor
                                                    label={item.label}
                                                    value={htmlToDelta(html)}
                                                    // onChange={(val) => onChange(val)}
                                                    placeholder={`Enter ${item.label}`}
                                                    className="mt-1.5 [&_.ql-editor]:max-h-80 [&_.ql-editor]:min-h-[12rem]"
                                                    modules={editorModules}
                                                    error={errors[item.fieldname]?.message}
                                                    {...rest}
                                                />
                                            }}
                                            control={control}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Select':
                                    return (
                                        <Controller
                                            render={({ field: { onChange, value, ...rest } }) => {
                                                const options = item.options ? (item.options).split("\n").map(item => ({ label: item, value: item })) : [];
                                                return <SearchSelect
                                                    onChange={onChange}
                                                    value={value}
                                                    label={item.label}
                                                    lists={options}
                                                    placeholder={`${item.label}`}
                                                    error={errors[item.fieldname]?.message}
                                                    {...rest}
                                                />
                                            }}
                                            control={control}
                                            name={item.fieldname}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Link':
                                    return (
                                        <Controller
                                            render={({ field: { onChange, value, ...rest } }) => (
                                                <SearchSelect
                                                    onChange={onChange}
                                                    value={value}
                                                    label={item.label}
                                                    lists={item.options_list}
                                                    placeholder={`${item.label}`}
                                                    isAddNew={true}
                                                    rootItem={item}
                                                    error={errors[item.fieldname]?.message}
                                                    {...rest}
                                                />
                                            )}
                                            control={control}
                                            name={item.fieldname}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                case 'Table':
                                    return (
                                        <Controller
                                            render={({ field: { onChange, value, ...rest } }) => (
                                                <Table
                                                    onChange={onChange}
                                                    values={value}
                                                    label={item.label}
                                                    isAddNew={true}
                                                    rootItem={item}
                                                    tableFields={tables ? tables[item.fieldname] : {}}
                                                    error={errors[item.fieldname]?.message}
                                                    {...rest}
                                                />
                                            )}
                                            control={control}
                                            name={item.fieldname}
                                            {...register(item.fieldname)}
                                        />
                                    );

                                default:
                                    return (
                                        <></>
                                    );
                            }
                        })()}
                    </div>
                }
            })}
        </div>
    );
}