import React from 'react';
import { TextField, Select, MenuItem, FormControl, FormControlLabel, RadioGroup, Radio, Checkbox } from '@mui/material';

function DynamicFilterComponent({ filters }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
      {filters.map((filter, index) => {
        switch (filter.type) {
          case 'text':
            return (
              <TextField
                key={index}
                label={filter.label || ''}
                type="text"
                value={filter.value}
                onChange={filter.onChange}
                style={{ flex: 1, minWidth: '200px' }} // Ensures equal flex sizing
              />
            );

          case 'dropdown':
            return (
              <FormControl
                key={index}
                style={{ flex: 1, minWidth: '200px' }} // Equal width with TextField
              >
                  <Select
                    value={filter.value}
                    onChange={filter.onChange}
                    displayEmpty
                    MenuProps={{
                      getContentAnchorEl: null, // Ensures dropdown starts from the Select input
                      disablePortal: true, // Keeps dropdown within the same DOM tree
                      anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'left',
                      },
                      transformOrigin: {
                        vertical: 'top',
                        horizontal: 'left',
                      },
                    }}
                  >
                  <MenuItem value="">{filter.placeholder || 'Select an option'}</MenuItem>
                  {filter.options?.map((option, idx) => (
                    <MenuItem key={idx} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            );

          case 'radio':
            return (
              <RadioGroup
                key={index}
                value={filter.value}
                onChange={filter.onChange}
                row={filter.row || true}
              >
                {filter.options?.map((option, idx) => (
                  <FormControlLabel
                    key={idx}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                  />
                ))}
              </RadioGroup>
            );

          case 'checkbox':
            return (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={filter.value}
                    onChange={filter.onChange}
                  />
                }
                label={filter.label || ''}
              />
            );

          default:
            return null; // Skip unknown filter types
        }
      })}
    </div>
  );
}

export default DynamicFilterComponent;