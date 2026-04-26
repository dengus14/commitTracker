import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createFetchGitHub } from '../utils/githubApi';

export const useRepoHealth = () => {

    const { user, token } = useAuth()
    const [loading, setLoading] = useState(false)
    const [repos, setRepos] = useState(null)
    const [error, setError] = useState('')
    const isLoadingRef = useRef(false)

    const fetchRepoHealth = useCallback(async (username) => {
        
    },[user,token])



    return {loading, repos, error, fetchRepoHealth}
}