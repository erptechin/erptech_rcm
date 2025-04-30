// Import Dependencies
import {
  Transition,
  TransitionChild,
  DialogPanel,
  Dialog
} from "@headlessui/react";
import { useDisclosure } from "hooks";
import { Button } from "components/ui";
import { forwardRef, Fragment, useEffect, useState } from "react";
import { TiDelete } from "react-icons/ti";
import PropTypes from "prop-types";
import { ConfirmModal } from "components/shared/ConfirmModal";
import { JWT_HOST_API } from 'configs/auth.config';

// Local Imports
import { getListData } from 'utils/apis';
import SubValues from "./subValues";

// ----------------------------------------------------------------------

const Table = forwardRef(({ onChange, values, label, rootItem, tableFields, error }, ref) => {
  const [listData, setListData] = useState([]);
  const [newValues, setNewValues] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [state, setState] = useState({ status: "pending" });

  useEffect(() => {
    if (values) {
      setNewValues(values)
    }
  }, [values])

  useEffect(() => {
    if (rootItem?.sub_fields) {
      filterData()
    }
  }, [newValues])

  const filterData = async () => {
    let data = {}
    for (let item of rootItem.sub_fields) {
      if (item.fieldtype === "Link") {
        const doctype = item.options
        const fields = tableFields[item.fieldname]
        const filters = values ? values.map(value => value[item.fieldname]) : []
        let res = await getListData({ doctype, filters: JSON.stringify([[doctype, "name", "in", filters]]), fields: JSON.stringify(["name", ...fields]) })
        data[item.fieldname] = res.data
      }
    }
    setListData(data)
  }

  const [isOpen, { open, close }] = useDisclosure(false);

  const closePopup = (data) => {
    if (data) {
      setListData([])
      const seen = new Set();
      const uniqueLists = [];
      if (rootItem.sub_fields) {
        for (const item of [...newValues, data]) {
          const key = rootItem.sub_fields.map(k => item[k.fieldname]).join("|");
          if (!seen.has(key)) {
            seen.add(key);
            uniqueLists.push(item);
          }
        }
      } else {
        uniqueLists.push(data);
      }
      setNewValues(uniqueLists)
      onChange(uniqueLists)
    }
    close()
  }

  const handleDelete = () => {
    if (state) {
      const new_values = newValues
      if (state.key > -1) {
        new_values.splice(state.key, 1);
      }
      setNewValues(new_values)
      onChange(new_values)
      setState({ status: "success" })
    }
  }

  const confirmMessages = {
    pending: {
      description:
        `Are you sure you want to delete this, it cannot be restored.`,
    },
    success: {
      title: `Item Deleted`,
    },
  };

  return (
    <>
      <div>
        <div className="flex items-center">
          <label className="input-label"><span className="input-label">{label}</span></label>
          <Button onClick={open} color="secondary" className="ml-auto">ADD NEW</Button>
        </div>

        <div className="relative mt-1.5">
          <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {newValues.map((item, key) => {
              let html = ``
              Object.keys(tableFields).map((field, k) => {
                if (typeof (tableFields[field]) === 'boolean' && item[field]) {
                  html += `<h2 class="line-clamp-1 mb-2 text-lg font-bold tracking-wide">${item[field]}</h2>`
                }
                if (field === 'image' && item[field]) {
                  html += `<img class="avatar-image avatar-display relative h-30 w-full before:absolute before:inset-0 before:rounded-[inherit] before:bg-gray-150 dark:before:bg-dark-600 rounded-lg" alt="avatar" loading="lazy" src="${JWT_HOST_API + item[field]}" />`
                }
                if (field === 'color' && item[field]) {
                  html += `<div class="badge-base badge this:error text-this-darker bg-this-darker/[0.07] dark:text-this-lighter dark:bg-this-lighter/10 border border-this-darker/20 dark:border-this-lighter/20" style="border: solid 1px #ff4f19; color:#fff; background: ${item[field]};">${item[field]}</div>`
                }
                if (typeof (tableFields[field]) === 'object') {
                  let selItem = listData[field] ? listData[field].find((list) => list.name === item[field]) : {}
                  Object.keys(tableFields[field]).map((k) => {
                    let keyName = tableFields[field][k]
                    html += `<p class="line-clamp-1 mb-1 font-medium tracking-wide">${selItem ? selItem[keyName] : ''}</p>`
                  })
                }
              })
              return <div key={key} className="relative">
                <Button onClick={() => { setDeleteModalOpen(true); setState({ status: "pending", key }) }} color="error" isIcon className="size-6 rounded-full absolute z-11 top-[-10px] right-[-10px]"><TiDelete className="size-5" /></Button>
                <div className="relative break-words print:border rounded-lg bg-primary-600 px-4 py-4 text-white dark:bg-primary-500 sm:px-5" dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            }
            )}
          </div>
          <span className="input-text-error mt-1 text-xs text-error dark:text-error-lighter"> {error}</span>

        </div>

      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-100" onClose={close}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity dark:bg-black/40" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out transform-gpu transition-transform duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in transform-gpu transition-transform duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed right-0 top-0 flex h-full w-150 transform-gpu flex-col bg-white transition-transform duration-200 dark:bg-dark-700">
              {isOpen && (<SubValues onClose={(data) => closePopup(data)} id={null} doctype={rootItem.options} />)}
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>

      <ConfirmModal
        show={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        messages={confirmMessages}
        onOk={handleDelete}
        confirmLoading={deleteLoading}
        state={state.status}
      />

    </>
  );
});

Table.displayName = "Table";

Table.propTypes = {
  onChange: PropTypes.func,
  values: PropTypes.string,
  label: PropTypes.string,
  rootItem: PropTypes.object,
  tableFields: PropTypes.array,
};

export { Table };
