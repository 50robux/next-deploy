'use client';

import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import {
    Container,
    Typography,
    Button,
    Box,
    Paper,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import {
    DataGrid,
    GridColDef,
    GridRenderCellParams,
    GridToolbar,
    GridPaginationModel,
} from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { NotificationContext } from '../../../contexts/NotificationContext';

interface Video {
    id: number;
    title: string;
    price: number;
    createdAt: string;
    thumbnailUrl: string;
    videoUrl: string;
    description: string;
}

export default function AdminVideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [openPreview, setOpenPreview] = useState(false);
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [videoToDelete, setVideoToDelete] = useState<number | null>(null);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        pageSize: 10,
        page: 0,
    });
    const router = useRouter();
    const { showNotification } = useContext(NotificationContext);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const res = await fetch('/api/admin/videos');
            const data = await res.json();
            if (data.success) {
                setVideos(data.videos);
            } else {
                showNotification(data.message || 'Failed to fetch videos', 'error');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            showNotification('Failed to fetch videos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = (video: Video) => {
        setSelectedVideo(video);
        setOpenPreview(true);
    };

    const handleDeleteClick = (id: number) => {
        setVideoToDelete(id);
        setOpenDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!videoToDelete) return;

        try {
            const res = await fetch(`/api/admin/videos/${videoToDelete}`, {
                method: 'DELETE',
                credentials: 'include', // ส่ง cookies
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to delete video');
            }

            const data = await res.json();

            if (data.success) {
                setVideos(videos.filter((video) => video.id !== videoToDelete));
                showNotification(data.message || 'Video deleted successfully', 'success');
            } else {
                throw new Error(data.message || 'Failed to delete video');
            }
        } catch (error) {
            console.error('Error deleting video:', error);
            showNotification(
                error instanceof Error ? error.message : 'Failed to delete video',
                'error'
            );
        } finally {
            setOpenDeleteConfirm(false);
            setVideoToDelete(null);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'thumbnailUrl',
            headerName: 'Thumbnail',
            width: 150,
            renderCell: (params: GridRenderCellParams) => (
                <Box sx={{
                    width: 120,
                    height: 68,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    overflow: 'hidden'
                }}>
                    {params.value && (
                        <img
                            src={params.value}
                            alt="thumbnail"
                            loading="lazy"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                    )}
                </Box>
            ),
        },
        { field: 'id', headerName: 'ID', width: 70 },
        {
            field: 'title',
            headerName: 'Title',
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Tooltip title={params.value}>
                    <Typography noWrap>{params.value}</Typography>
                </Tooltip>
            ),
        },
        {
            field: 'price',
            headerName: 'Price',
            width: 120,
            renderCell: (params: GridRenderCellParams) => (
                <Typography>฿{Number(params.value).toLocaleString()}</Typography>
            ),
        },
        {
            field: 'createdAt',
            headerName: 'Created At',
            width: 180,
            renderCell: (params: GridRenderCellParams) => {
                const date = new Date(params.value);
                const isValidDate = !isNaN(date.getTime());
                return isValidDate ? date.toLocaleString() : 'Invalid Date';
            },
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 180,
            renderCell: (params: GridRenderCellParams) => (
                <Box>
                    <Tooltip title="Preview">
                        <IconButton onClick={() => handlePreview(params.row)} size="small">
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton
                            component={Link}
                            href={`/admin/videos/edit/${params.row.id}`}
                            size="small"
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton
                            onClick={() => handleDeleteClick(params.row.id)}
                            color="error"
                            size="small"
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} sm={6}>
                        <Typography variant="h5" component="h1">
                            Videos ({videos.length})
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                component={Link}
                                href="/admin/videos/create"
                            >
                                Add Video
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                component={Link}
                                href="/admin/videos/import"
                            >
                                Import CSV
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Paper sx={{ height: 600, bgcolor: 'background.paper' }}>
                <DataGrid
                    rows={videos}
                    columns={columns}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50]}
                    disableRowSelectionOnClick
                    loading={loading}
                    slots={{
                        toolbar: GridToolbar,
                    }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                />
            </Paper>

            {/* Preview Dialog */}
            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {selectedVideo?.title}
                </DialogTitle>
                <DialogContent>
                    {selectedVideo && (
                        <Box>
                            <Box sx={{
                                position: 'relative',
                                paddingTop: '56.25%',
                                mb: 2,
                                bgcolor: 'background.paper',
                                borderRadius: 1,
                                overflow: 'hidden'
                            }}>
                                {selectedVideo.thumbnailUrl && (
                                    <img
                                        src={selectedVideo.thumbnailUrl}
                                        alt="Preview"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}
                            </Box>
                            <Typography variant="body1" paragraph>
                                {selectedVideo.description}
                            </Typography>
                            <Typography variant="h6">
                                ฿{selectedVideo.price.toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPreview(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteConfirm}
                onClose={() => setOpenDeleteConfirm(false)}
            >
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this video?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
