import React, { useEffect, useState } from 'react';
import api from '../../services/api';

import { CustomCatalogShowcase } from './CustomCatalogShowcase';

export const DynamicZone = ({
  page = 'home',
  slot = 'main',
  componentsMap = {},
  fallback = null
}) => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultRegistry = {
    custom_showcase: CustomCatalogShowcase,
    ...componentsMap
  };

  useEffect(() => {
    let isMounted = true;
    const fetchLayout = async () => {
      try {
        setLoading(true);
        const response = await api.get('/layout.php', {
          params: { page, slot }
        });
        if (isMounted) {
          if (Array.isArray(response.data)) {
            setSections(response.data);
          } else if (response.data && Array.isArray(response.data.sections)) {
            setSections(response.data.sections);
          }
        }
      } catch (err) {
        console.warn(`Failed to fetch dynamic layout for ${page}/${slot}:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLayout();
    return () => {
      isMounted = false;
    };
  }, [page, slot]);

  if (loading) {
    return (
      <div className="py-8 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return fallback || null;
  }

  return (
    <div className="dynamic-zone-container space-y-12">
      {sections.map((section) => {
        const Component = defaultRegistry[section.section_key];
        if (!Component) return null;
        return (
          <div key={section.section_key || section.id} className="dynamic-section-wrapper">
            <Component sectionData={section} />
          </div>
        );
      })}
    </div>
  );
};

export default DynamicZone;
