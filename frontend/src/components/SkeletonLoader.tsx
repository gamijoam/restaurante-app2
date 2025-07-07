import React from 'react';
import { Box, Skeleton, Card, CardContent, Grid } from '@mui/material';

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'table' | 'grid';
  count?: number;
  height?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ 
  variant = 'card', 
  count = 3, 
  height = 200 
}) => {
  const renderCardSkeleton = () => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Skeleton variant="rectangular" height={140} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" height={20} width="60%" />
        <Skeleton variant="text" height={20} width="40%" sx={{ mt: 1 }} />
      </CardContent>
    </Card>
  );

  const renderListSkeleton = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" height={20} width="80%" />
        <Skeleton variant="text" height={16} width="60%" />
      </Box>
      <Skeleton variant="rectangular" width={60} height={32} />
    </Box>
  );

  const renderTableSkeleton = () => (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" height={56} sx={{ mb: 1 }} />
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton 
          key={index} 
          variant="rectangular" 
          height={48} 
          sx={{ mb: 0.5 }} 
        />
      ))}
    </Box>
  );

  const renderGridSkeleton = () => (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          {renderCardSkeleton()}
        </Grid>
      ))}
    </Grid>
  );

  const renderContent = () => {
    switch (variant) {
      case 'list':
        return (
          <Box sx={{ width: '100%' }}>
            {Array.from({ length: count }).map((_, index) => (
              <Box key={index} sx={{ mb: 1 }}>
                {renderListSkeleton()}
              </Box>
            ))}
          </Box>
        );
      case 'table':
        return renderTableSkeleton();
      case 'grid':
        return renderGridSkeleton();
      default:
        return (
          <Grid container spacing={2}>
            {Array.from({ length: count }).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                {renderCardSkeleton()}
              </Grid>
            ))}
          </Grid>
        );
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: height,
      p: variant === 'list' ? 0 : 2 
    }}>
      {renderContent()}
    </Box>
  );
};

export default SkeletonLoader; 