import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { FestivalThemeSelector } from '../../components/admin/FestivalThemeSelector';
import { CustomCatalogManager } from '../../components/admin/CustomCatalogManager';
import { AdvancedLayoutBuilder } from '../../components/admin/AdvancedLayoutBuilder';

export const SiteSettings = () => {
  return (
    <AdminLayout title="Site Management & Layout Builder">
      <div className="space-y-8 font-sans">
        {/* Dynamic Festival Themes Section */}
        <FestivalThemeSelector />

        {/* Custom Catalog Showcase Manager */}
        <CustomCatalogManager />

        {/* Dynamic Page Layout Builder Section */}
        <AdvancedLayoutBuilder />
      </div>
    </AdminLayout>
  );
};

export default SiteSettings;
