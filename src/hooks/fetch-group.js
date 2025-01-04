import { useState, useEffect, useCallback } from 'react';
import { getGroup, getGroup2 } from '../services/group-services';

export function useFetchGroup(groupId) {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Create a memoized fetch function that can be called on demand
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getGroup(groupId);
            setGroup(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    // Initial fetch on mount and groupId change
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Return fetchData as the fourth element in the array
    return [group, loading, error, fetchData];
}

export function useFetchGroup2(groupId) {
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getGroup2(groupId);
            console.log('Group data received:', data);  // Add this
            setGroup(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching group:', err);  // Add this
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return [group, loading, error, fetchData];
}