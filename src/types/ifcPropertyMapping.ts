export interface IFCPropertyMapping {
  // Semantic field name -> Array of possible IFC property names (in priority order)
  assemblyNumber: string[];
  elementId: string[];
  tag: string[];
  reference: string[];
  mark: string[];
}

export const DEFAULT_IFC_PROPERTY_MAPPING: IFCPropertyMapping = {
  assemblyNumber: [
    'ASSEMBLY_POS',
    'Assembly_Pos', 
    'ASSEMBLY_NUMBER',
    'AssemblyNumber',
    'Mark',
    'PieceMark',
    'Position'
  ],
  elementId: [
    'GlobalId',
    'GUID',
    'ElementID',
    'Element_ID'
  ],
  tag: [
    'Tag',
    'ElementTag',
    'Element_Tag'
  ],
  reference: [
    'Reference',
    'ElementReference',
    'Ref'
  ],
  mark: [
    'Mark',
    'ElementMark',
    'PartMark'
  ]
};

// Storage key for localStorage
export const IFC_PROPERTY_MAPPING_STORAGE_KEY = 'ifc_property_mapping';

export const getPropertyMapping = (): IFCPropertyMapping => {
  try {
    const stored = localStorage.getItem(IFC_PROPERTY_MAPPING_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load property mapping:', error);
  }
  return DEFAULT_IFC_PROPERTY_MAPPING;
};

export const savePropertyMapping = (mapping: IFCPropertyMapping): void => {
  try {
    localStorage.setItem(IFC_PROPERTY_MAPPING_STORAGE_KEY, JSON.stringify(mapping));
  } catch (error) {
    console.error('Failed to save property mapping:', error);
  }
};

export const resetPropertyMapping = (): void => {
  localStorage.removeItem(IFC_PROPERTY_MAPPING_STORAGE_KEY);
};
