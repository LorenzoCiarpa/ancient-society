import './rpaginationpanel.scss';

import { useMemo } from 'react';

function RPaginationPanel(props) {
    // paginate info
    const canPreviousPage = useMemo(() => props.canPreviousPage, [props.canPreviousPage])
    const canNextPage = useMemo(() => props.canNextPage, [props.canNextPage])
    const totalCount = useMemo(() => props.totalCount, [props.totalCount])
    const pageIndex = useMemo(() => props.pageIndex, [props.pageIndex])
    const pageSize = useMemo(() => props.pageSize, [props.pageSize])

    return (<>
        <div className='rpaginationpanel'>
            {/* page info */}
            <div className='page-info-text'>
                Showing <a>{pageIndex * pageSize + 1}</a> ~ <a>{Math.min(totalCount, (pageIndex + 1) * pageSize)}</a> of <a>{totalCount}</a>
            </div>

            {/* prev|next paginate button */}
            <div className={`previousPageBtn ${canPreviousPage ? '' : 'notAllowed'}`} onClick={props.onPrev} />
            <div className={`nextPageBtn ${canNextPage ? '' : 'notAllowed'}`} onClick={props.onNext} />
        </div>
    </>)
}

export default RPaginationPanel