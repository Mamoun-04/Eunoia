
import { RadioGroup, RadioGroupItem } from "./radio-group"

export function ExampleUsage() {
  return (
    <RadioGroup defaultValue="option-1">
      <RadioGroupItem value="option-1" id="option-1" />
      <RadioGroupItem value="option-2" id="option-2" />
    </RadioGroup>
  )
}
