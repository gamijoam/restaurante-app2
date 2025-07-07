import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import { 
  MoreVert, 
  Favorite, 
  Share, 
  Bookmark,
} from '@mui/icons-material';

interface ModernCardProps {
  title?: string;
  subtitle?: string;
  content?: React.ReactNode;
  image?: string;
  imageHeight?: number;
  actions?: React.ReactNode;
  chips?: string[];
  avatar?: string;
  onFavorite?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  onMore?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  hover?: boolean;
  children?: React.ReactNode;
}

const ModernCard: React.FC<ModernCardProps> = ({
  title,
  subtitle,
  content,
  image,
  imageHeight = 200,
  actions,
  chips,
  avatar,
  onFavorite,
  onShare,
  onBookmark,
  onMore,
  variant = 'default',
  hover = true,
  children,
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'elevated':
        return { elevation: 8 };
      case 'outlined':
        return { variant: 'outlined' as const };
      default:
        return { elevation: 2 };
    }
  };

  return (
    <Card
      {...getVariantProps()}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: hover ? 'all 0.3s ease' : 'none',
        '&:hover': hover ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        } : {},
        border: variant === 'outlined' ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    >
      {image && (
        <CardMedia
          component="img"
          height={imageHeight}
          image={image}
          alt={title || 'Card image'}
          sx={{
            objectFit: 'cover',
          }}
        />
      )}

      {(title || subtitle || avatar) && (
        <CardHeader
          avatar={avatar ? (
            <Avatar src={avatar} alt={title} />
          ) : undefined}
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {onFavorite && (
                <IconButton size="small" onClick={onFavorite}>
                  <Favorite />
                </IconButton>
              )}
              {onShare && (
                <IconButton size="small" onClick={onShare}>
                  <Share />
                </IconButton>
              )}
              {onBookmark && (
                <IconButton size="small" onClick={onBookmark}>
                  <Bookmark />
                </IconButton>
              )}
              {onMore && (
                <IconButton size="small" onClick={onMore}>
                  <MoreVert />
                </IconButton>
              )}
            </Box>
          }
          title={
            title ? (
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            ) : undefined
          }
          subheader={
            subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : undefined
          }
          sx={{
            pb: chips ? 1 : 2,
          }}
        />
      )}

      {chips && chips.length > 0 && (
        <Box sx={{ px: 2, pb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {chips.map((chip, index) => (
              <Chip
                key={index}
                label={chip}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {(content || children) && (
        <CardContent sx={{ flexGrow: 1, pt: chips ? 0 : 2 }}>
          {content}
          {children}
        </CardContent>
      )}

      {actions && (
        <>
          <Divider />
          <CardActions sx={{ justifyContent: 'flex-end', p: 2 }}>
            {actions}
          </CardActions>
        </>
      )}
    </Card>
  );
};

export default ModernCard; 