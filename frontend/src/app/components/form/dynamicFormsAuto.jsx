import { useRef } from "react";
import { Controller } from 'react-hook-form';
import { SketchPicker } from 'react-color';
import Cleave from "cleave.js/react";
import TextareaAutosize from "react-textarea-autosize";
import { ContextualHelp } from "components/shared/ContextualHelp";
import { Input, Textarea, Checkbox, Button, Upload, Avatar } from "components/ui";
import { DatePicker } from "components/shared/form/Datepicker";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { TextEditor } from "components/shared/form/TextEditor";
import { htmlToDelta } from "utils/quillUtils";
import { JWT_HOST_API } from 'configs/auth.config';
import { SearchSelect } from "./SearchSelect";
import { TableBox } from "./TableBox";
import clsx from "clsx";

const editorModules = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ header: 1 }, { header: 2 }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }],
        [{ indent: "-1" }, { indent: "+1" }],
        [{ direction: "rtl" }],
        [{ size: ["small", false, "large", "huge"] }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [{ color: [] }, { background: [] }],
        [{ font: [] }],
        [{ align: [] }, "image"],
        ["clean"],
    ],
};

export default function DynamicFormsAuto({ infos, ignorFields, register, control, errors, tables }) {
    const uploadRef = useRef();

    // Split fields into columns based on Column Break and Section Break
    const columns = infos.fields.reduce((acc, info) => {
        if (info.fieldtype == "HTML" || ignorFields.includes(info.fieldname)) return acc;

        if (info.fieldtype === 'Section Break') {
            acc.push({
                isSection: true,
                label: info.label,
                description: info.description,
                fields: [[]]
            });
        } else if (info.fieldtype === 'Column Break') {
            if (acc.length === 0) {
                acc.push({
                    isSection: true,
                    fields: [[]]
                });
            }
            const currentSection = acc[acc.length - 1];
            currentSection.fields.push([]);
        } else {
            if (acc.length === 0) {
                acc.push({
                    isSection: true,
                    fields: [[]]
                });
            }
            const currentSection = acc[acc.length - 1];
            const currentColumn = currentSection.fields[currentSection.fields.length - 1];
            currentColumn.push(info);
        }
        return acc;
    }, []);

    // console.log(columns)

    const renderField = (item) => {
        if (!item) return null;

        return (
            <div key={item.fieldname} className="form-group my-2" id={item.fieldname}>
                {(() => {
                    switch (item.fieldtype) {
                        case 'Attach':
                        case 'Attach Image':
                            return (
                                <Controller
                                    render={({ field: { value, onChange } }) => {
                                        return <div>
                                            <Upload onChange={onChange} ref={uploadRef}>
                                                {({ ...props }) => (
                                                    <Button
                                                        {...props}
                                                        unstyled
                                                        className={clsx(
                                                            "mt-3 w-full shrink-0 flex-col rounded-lg border-2 border-dashed py-10 border-gray-300 dark:border-dark-450"
                                                        )}
                                                    >
                                                        <CloudArrowUpIcon className="size-12" />
                                                        <span className={clsx("pointer-events-none mt-2 text-gray-600 dark:text-dark-200")}>
                                                            <span className="text-primary-600 dark:text-primary-400">Browse</span>
                                                            <span> or drop your files here</span>
                                                        </span>
                                                    </Button>
                                                )}
                                            </Upload>
                                            {value && <div className="mt-4 flex flex-col space-y-4">
                                                <div className="relative inline-block">
                                                    <Avatar
                                                        size={24}
                                                        src={`${JWT_HOST_API}${value}`}
                                                        classNames={{ display: "rounded-lg" }}
                                                    />
                                                    <button
                                                        onClick={() => onChange(null)}
                                                        className="absolute -left-2 -top-2 flex size-5 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="size-3" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>}
                                        </div>
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
                        case 'Text':
                        case 'Int':
                        case 'Float':
                            return (
                                <Controller
                                    render={({ field: { onChange, value } }) => {
                                        if ((item.label && (item.label.toLowerCase().endsWith('mobile') || item.label.toLowerCase().endsWith('phone') || item.label.toLowerCase().startsWith('mobile') || item.label.toLowerCase().startsWith('phone')))) {
                                            return <Input
                                                value={value}
                                                onChange={onChange}
                                                label={item.label}
                                                placeholder={`Enter the ${item.label}`}
                                                component={Cleave}
                                                options={{
                                                    numericOnly: true,
                                                    blocks: [0, 3, 3, 4],
                                                    delimiters: [' ', ' ', '-']
                                                }}
                                                error={errors[item.fieldname]?.message}
                                            />
                                        } else {
                                            return <div className="items-center w-full relative">
                                                <Input
                                                    type={item.fieldtype === 'Int' || item.fieldtype === 'Float' ? "number" : "text"}
                                                    value={value}
                                                    onChange={onChange}
                                                    label={item.label}
                                                    component={item.fieldtype === 'Int' || item.fieldtype === 'Float' ? Cleave : undefined}
                                                    options={
                                                        item.fieldtype === 'Int'
                                                            ? {
                                                                numeral: true,
                                                                numeralThousandsGroupStyle: 'thousand',
                                                                numeralDecimalScale: 0,
                                                                numeralPositiveOnly: true
                                                            }
                                                            : item.fieldtype === 'Float'
                                                                ? {
                                                                    numeral: true,
                                                                    numeralThousandsGroupStyle: 'thousand',
                                                                    numeralDecimalScale: 2,
                                                                    numeralPositiveOnly: true,
                                                                    delimiter: ','
                                                                }
                                                                : undefined
                                                    }
                                                    error={errors[item.fieldname]?.message}
                                                />
                                                <div className="absolute top-0 right-0">
                                                    {item.description && <ContextualHelp
                                                        content={item.description}
                                                    />}
                                                </div>
                                            </div>
                                        }
                                    }}
                                    control={control}
                                    {...register(item.fieldname)}
                                />
                            );

                        case 'Currency':
                            return (
                                <Controller
                                    render={({ field: { value } }) => (
                                        <Input
                                            type="number"
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
                                    variant="outlined"
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
                                    component={TextareaAutosize}
                                    minRows={4}
                                    maxRows={12}
                                    {...register(item.fieldname)}
                                    error={errors[item.fieldname]?.message}
                                />
                            );

                        case 'Text Editor':
                        case 'HTML':
                            return (
                                <Controller
                                    render={({ field: { value, onChange, ...rest } }) => {
                                        let newValue = typeof value === 'object' ? value.ops[0].insert : (value ? value : '')
                                        const html = `${newValue}`;
                                        return <TextEditor
                                            label={item.label}
                                            value={htmlToDelta(html)}
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
                                        return <div className="max-w-full">
                                            <SearchSelect
                                                onChange={onChange}
                                                value={value}
                                                label={item.label}
                                                lists={options}
                                                placeholder={`${item.label}`}
                                                error={errors[item.fieldname]?.message}
                                                {...rest}
                                            />
                                        </div>
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
                                        <div className="max-w-full">
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
                                        </div>
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
                                        <TableBox
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

                        case 'Date':
                        case 'Time':
                        case 'Datetime':
                            return (
                                <Controller
                                    render={({ field: { onChange, value, ...rest } }) => {
                                        const onChangeDate = (obj) => {
                                            const date = new Date(obj[0]);
                                            date.setDate(date.getDate() + 1);
                                            const formatted = new Date(date).toISOString().split('T')[0];
                                            onChange(formatted)
                                        }
                                        return <div className="items-center w-full relative">
                                            <DatePicker
                                                onChange={onChangeDate}
                                                value={value || ""}
                                                label={item.label}
                                                error={errors[item.fieldname]?.message}
                                                options={
                                                    item.fieldtype === 'Time'
                                                        ? {
                                                            enableTime: true,
                                                            noCalendar: true,
                                                        }
                                                        : item.fieldtype === 'Datetime'
                                                            ? {
                                                                enableTime: true,
                                                                disableMobile: true
                                                            }
                                                            : {
                                                                disableMobile: true
                                                            }
                                                }
                                                placeholder={`Enter the ${item.label}`}
                                                {...rest}
                                            />
                                            <div className="absolute top-0 right-0">
                                                {item.description && <ContextualHelp content={item.description} />}
                                            </div>
                                        </div>
                                    }}
                                    control={control}
                                    name={item.fieldname}
                                    {...register(item.fieldname)}
                                />
                            );

                        default:
                            return (
                                <>new ... {item.fieldtype}</>
                            );
                    }
                })()}
            </div>
        );
    };

    return (
        <div className="w-full space-y-2">
            {columns.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                    {section.label && (
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{section.label}</h3>
                            {section.description && (
                                <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                            )}
                        </div>
                    )}
                    {section.fields.some(column => column.length > 0) && (
                        <div className="flex flex-col md:flex-row flex-wrap gap-4 border-[0.1px] border-gray-200 rounded-lg">
                            {section.fields.map((column, columnIndex) => <div key={columnIndex} className={`flex-1 min-w-[250px] px-4 md:y-4 sm:y-2`}>
                                {column.map(renderField)}
                            </div>)}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}