import * as Select from '@radix-ui/react-select'

export type ListingSelectOption = {
  label: string
  value: string
}

type ListingSelectProps = {
  describedBy?: string
  direction: 'ltr' | 'rtl'
  id: string
  invalid: boolean
  label: string
  name: string
  onChange: (value: string) => void
  options: ListingSelectOption[]
  placeholder: string
  value: string
}

const EMPTY_VALUE = '__listing-select-empty__'

export function ListingSelect({
  describedBy,
  direction,
  id,
  invalid,
  label,
  name,
  onChange,
  options,
  placeholder,
  value,
}: ListingSelectProps) {
  const items = [{ label: placeholder, value: EMPTY_VALUE }, ...options]

  return (
    <div className="listing-select" dir={direction}>
      <input name={name} type="hidden" value={value} />
      <Select.Root
        dir={direction}
        onValueChange={(nextValue) => onChange(nextValue === EMPTY_VALUE ? '' : nextValue)}
        value={value || EMPTY_VALUE}
      >
        <Select.Trigger
          aria-describedby={describedBy}
          aria-invalid={invalid}
          aria-label={label}
          className={`listing-select__trigger${value ? '' : ' listing-select__trigger--placeholder'}`}
          id={id}
        >
          <Select.Value />
          <Select.Icon asChild>
            <span aria-hidden="true" className="listing-select__chevron" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            align="start"
            aria-label={label}
            className="listing-select__content"
            collisionPadding={12}
            dir={direction}
            position="popper"
            sideOffset={6}
          >
            <Select.Viewport className="listing-select__viewport">
              {items.map((option) => (
                <Select.Item
                  className="listing-select__option"
                  key={option.value}
                  textValue={option.label}
                  value={option.value}
                >
                  <Select.ItemIndicator className="listing-select__check">
                    <span aria-hidden="true">✓</span>
                  </Select.ItemIndicator>
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
